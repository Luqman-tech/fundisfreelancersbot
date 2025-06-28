const whatsappService = require('../services/whatsapp/whatsappService');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

class WebhookController {
  // WhatsApp webhook verification
  verifyWhatsApp(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
        logger.info('WhatsApp webhook verified');
        res.status(200).send(challenge);
      } else {
        logger.warn('WhatsApp webhook verification failed');
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  }

  // Handle incoming WhatsApp messages
  async handleWhatsApp(req, res) {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        body.entry?.forEach(entry => {
          entry.changes?.forEach(change => {
            if (change.field === 'messages') {
              const messages = change.value.messages;
              const contacts = change.value.contacts;

              if (messages && messages.length > 0) {
                messages.forEach(message => {
                  whatsappService.handleIncomingMessage(message, contacts);
                });
              }
            }
          });
        });
      }

      res.status(200).send('OK');
    } catch (error) {
      logger.error('WhatsApp webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      });
    }
  }

  // Handle M-Pesa payment callback
  async handleMpesaCallback(req, res) {
    try {
      const { Body } = req.body;
      
      if (Body && Body.stkCallback) {
        await paymentService.handleMpesaCallback(Body.stkCallback);
      }

      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Success',
      });
    } catch (error) {
      logger.error('M-Pesa callback error:', error);
      res.status(200).json({
        ResultCode: 1,
        ResultDesc: 'Failed',
      });
    }
  }

  // Handle M-Pesa timeout
  async handleMpesaTimeout(req, res) {
    try {
      const { Body } = req.body;
      
      if (Body && Body.stkCallback) {
        await paymentService.handleMpesaTimeout(Body.stkCallback);
      }

      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Success',
      });
    } catch (error) {
      logger.error('M-Pesa timeout error:', error);
      res.status(200).json({
        ResultCode: 1,
        ResultDesc: 'Failed',
      });
    }
  }
}

module.exports = new WebhookController();