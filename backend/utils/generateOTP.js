const crypto = require('crypto');

// Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random token (for email verification)
exports.generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token
exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

