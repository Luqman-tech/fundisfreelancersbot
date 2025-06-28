const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

// WhatsApp webhook
router.get('/whatsapp', webhookController.verifyWhatsApp);
router.post('/whatsapp', webhookController.handleWhatsApp);

// M-Pesa webhook
router.post('/mpesa/callback', webhookController.handleMpesaCallback);
router.post('/mpesa/timeout', webhookController.handleMpesaTimeout);

module.exports = router;