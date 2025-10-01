const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email
exports.sendEmail = async (options) => {
  const mailOptions = {
    from: `${options.fromName || 'Loan App'} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.email);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; border: 2px dashed #667eea; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
          <div class="otp-box">${otp}</div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Loan App Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Loan Web Application. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    email,
    subject: 'Email Verification - Loan App',
    html
  });
};

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Loan App! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Welcome aboard! Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>Request loans instantly</li>
            <li>Make repayments via mobile money</li>
            <li>Track your loan status and repayment history</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>Loan App Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Loan Web Application. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    email,
    subject: 'Welcome to Loan App!',
    html
  });
};

