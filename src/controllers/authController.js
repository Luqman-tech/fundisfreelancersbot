const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { redisClient } = require('../config/redis');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const { generateOTP, generateTokens } = require('../utils/auth');

class AuthController {
  async register(req, res) {
    try {
      const { phoneNumber, firstName, lastName, email } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { phoneNumber } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this phone number already exists',
        });
      }

      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP in Redis (expires in 5 minutes)
      await redisClient.setEx(`otp:${phoneNumber}`, 300, otp);

      // Send OTP via SMS
      await smsService.sendOTP(phoneNumber, otp);

      // Store user data temporarily
      await redisClient.setEx(
        `temp_user:${phoneNumber}`,
        300,
        JSON.stringify({ phoneNumber, firstName, lastName, email })
      );

      logger.info(`OTP sent to ${phoneNumber}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: { phoneNumber },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message,
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { phoneNumber, otp } = req.body;

      // Verify OTP
      const storedOTP = await redisClient.get(`otp:${phoneNumber}`);
      if (!storedOTP || storedOTP !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }

      // Get temporary user data
      const tempUserData = await redisClient.get(`temp_user:${phoneNumber}`);
      if (!tempUserData) {
        return res.status(400).json({
          success: false,
          message: 'Registration session expired',
        });
      }

      const userData = JSON.parse(tempUserData);

      // Create user
      const user = await User.create({
        ...userData,
        isVerified: true,
      });

      // Generate tokens
      const tokens = generateTokens(user.id);

      // Store refresh token
      await redisClient.setEx(`refresh_token:${user.id}`, 604800, tokens.refreshToken);

      // Clean up temporary data
      await redisClient.del(`otp:${phoneNumber}`);
      await redisClient.del(`temp_user:${phoneNumber}`);

      logger.info(`User registered successfully: ${user.id}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          tokens,
        },
      });
    } catch (error) {
      logger.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        error: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { phoneNumber } = req.body;

      // Check if user exists
      const user = await User.findOne({ where: { phoneNumber, isActive: true } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP in Redis
      await redisClient.setEx(`otp:${phoneNumber}`, 300, otp);

      // Send OTP via SMS
      await smsService.sendOTP(phoneNumber, otp);

      logger.info(`Login OTP sent to ${phoneNumber}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: { phoneNumber },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  async resendOTP(req, res) {
    try {
      const { phoneNumber } = req.body;

      // Generate new OTP
      const otp = generateOTP();
      
      // Store OTP in Redis
      await redisClient.setEx(`otp:${phoneNumber}`, 300, otp);

      // Send OTP via SMS
      await smsService.sendOTP(phoneNumber, otp);

      logger.info(`OTP resent to ${phoneNumber}`);

      res.status(200).json({
        success: true,
        message: 'OTP resent successfully',
      });
    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
        error: error.message,
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Check if refresh token exists in Redis
      const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const tokens = generateTokens(decoded.userId);

      // Update refresh token in Redis
      await redisClient.setEx(`refresh_token:${decoded.userId}`, 604800, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: error.message,
      });
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user?.id;

      if (userId) {
        // Remove refresh token from Redis
        await redisClient.del(`refresh_token:${userId}`);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();