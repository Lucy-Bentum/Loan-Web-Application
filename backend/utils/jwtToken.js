const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate refresh token
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

// Verify refresh token
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res) => {
  // Generate access token
  const accessToken = this.generateToken(user.id);
  
  // Generate refresh token
  const refreshToken = this.generateRefreshToken(user.id);

  // Remove password from user object
  const { password_hash, ...userWithoutPassword } = user;

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: userWithoutPassword
  });
};

