const express = require('express');
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin, validateOTP } = require('../middleware/validation');
const rateLimitAuth = require('../middleware/rateLimitAuth');

const router = express.Router();

// Authentication routes
router.post('/register', rateLimitAuth, validateRegistration, authController.register);
router.post('/login', rateLimitAuth, validateLogin, authController.login);
router.post('/verify-otp', rateLimitAuth, validateOTP, authController.verifyOTP);
router.post('/resend-otp', rateLimitAuth, authController.resendOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;