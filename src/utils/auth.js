const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return {
    accessToken,
    refreshToken,
  };
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, process.env.ENCRYPTION_KEY, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, hash) {
  const hashVerify = crypto.pbkdf2Sync(password, process.env.ENCRYPTION_KEY, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

module.exports = {
  generateOTP,
  generateTokens,
  generateSecureToken,
  hashPassword,
  verifyPassword,
};