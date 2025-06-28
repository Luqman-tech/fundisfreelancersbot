const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const providerRoutes = require('./providers');
const serviceRoutes = require('./services');
const bookingRoutes = require('./bookings');
const paymentRoutes = require('./payments');
const webhookRoutes = require('./webhooks');
const adminRoutes = require('./admin');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/providers', providerRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/admin', adminRoutes);

// Health check routes
router.get('/health/database', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    res.json({ status: 'OK', service: 'database' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', service: 'database', error: error.message });
  }
});

router.get('/health/redis', async (req, res) => {
  try {
    const { redisClient } = require('../config/redis');
    await redisClient.ping();
    res.json({ status: 'OK', service: 'redis' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', service: 'redis', error: error.message });
  }
});

module.exports = router;