const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');
const { sendTokenResponse, verifyRefreshToken, generateToken } = require('../utils/jwtToken');
const { generateOTP, generateToken: genToken, hashToken } = require('../utils/generateOTP');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, dateOfBirth, address } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate phone format (Ghana format)
    const phoneRegex = /^(\+233|0)[2-5][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Ghana phone number'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailToken = generateOTP();
    const phoneToken = generateOTP();

    // Insert user into database
    const [result] = await promisePool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, 
       email_verification_token, phone_verification_token, date_of_birth, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, passwordHash, emailToken, phoneToken, dateOfBirth || null, address || null]
    );

    // Get the created user
    const [users] = await promisePool.query(
      'SELECT id, first_name, last_name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];

    // Send verification email
    await sendOTPEmail(email, emailToken, firstName);

    // Send token response
    sendTokenResponse(user, 201, res);

    console.log(`✅ New user registered: ${email}`);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const [users] = await promisePool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await promisePool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Send token response
    sendTokenResponse(user, 200, res);

    console.log(`✅ User logged in: ${email}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in. Please try again.'
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Private
exports.verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide OTP'
      });
    }

    // Check if OTP matches
    const [users] = await promisePool.query(
      'SELECT id, first_name, email FROM users WHERE id = ? AND email_verification_token = ?',
      [req.user.id, otp]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update user as verified
    await promisePool.query(
      'UPDATE users SET is_email_verified = TRUE, email_verification_token = NULL WHERE id = ?',
      [req.user.id]
    );

    // Send welcome email
    await sendWelcomeEmail(users[0].email, users[0].first_name);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

    console.log(`✅ Email verified for user: ${users[0].email}`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email. Please try again.'
    });
  }
};

// @desc    Resend email OTP
// @route   POST /api/auth/resend-otp
// @access  Private
exports.resendOTP = async (req, res) => {
  try {
    // Generate new OTP
    const emailToken = generateOTP();

    // Update user
    await promisePool.query(
      'UPDATE users SET email_verification_token = ? WHERE id = ?',
      [emailToken, req.user.id]
    );

    // Send OTP email
    await sendOTPEmail(req.user.email, emailToken, req.user.first_name);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

    console.log(`✅ OTP resent to: ${req.user.email}`);
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP. Please try again.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      `SELECT id, first_name, last_name, email, phone, role, status, 
       is_email_verified, is_phone_verified, profile_image, address, 
       date_of_birth, id_number, created_at, last_login 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, dateOfBirth, idNumber } = req.body;

    const fieldsToUpdate = {};
    if (firstName) fieldsToUpdate.first_name = firstName;
    if (lastName) fieldsToUpdate.last_name = lastName;
    if (phone) fieldsToUpdate.phone = phone;
    if (address) fieldsToUpdate.address = address;
    if (dateOfBirth) fieldsToUpdate.date_of_birth = dateOfBirth;
    if (idNumber) fieldsToUpdate.id_number = idNumber;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), req.user.id];

    await promisePool.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    // Get updated user
    const [users] = await promisePool.query(
      `SELECT id, first_name, last_name, email, phone, role, status, 
       is_email_verified, is_phone_verified, profile_image, address, 
       date_of_birth, id_number FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get user with password
    const [users] = await promisePool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await promisePool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

    console.log(`✅ Password changed for user: ${req.user.email}`);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide refresh token'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateToken(decoded.id);

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

