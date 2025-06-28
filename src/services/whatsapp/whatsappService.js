const axios = require('axios');
const { User, ServiceProvider, Booking } = require('../../models');
const { redisClient } = require('../../config/redis');
const logger = require('../../utils/logger');
const conversationHandler = require('./conversationHandler');

class WhatsAppService {
  constructor() {
    this.baseURL = `https://graph.facebook.com/v${process.env.WHATSAPP_API_VERSION || 'v18.0'}`;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  async sendMessage(to, message) {
    try {
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        ...message,
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info(`Message sent to ${to}:`, response.data);
      return response.data;
    } catch (error) {
      logger.error('WhatsApp send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendTextMessage(to, text) {
    return this.sendMessage(to, {
      type: 'text',
      text: { body: text },
    });
  }

  async sendTemplateMessage(to, templateName, languageCode = 'en', components = []) {
    return this.sendMessage(to, {
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components,
      },
    });
  }

  async sendInteractiveMessage(to, interactive) {
    return this.sendMessage(to, {
      type: 'interactive',
      interactive: interactive,
    });
  }

  async sendButtonMessage(to, text, buttons) {
    const interactive = {
      type: 'button',
      body: { text: text },
      action: {
        buttons: buttons.map((button, index) => ({
          type: 'reply',
          reply: {
            id: button.id || `btn_${index}`,
            title: button.title,
          },
        })),
      },
    };

    return this.sendInteractiveMessage(to, interactive);
  }

  async sendListMessage(to, text, buttonText, sections) {
    const interactive = {
      type: 'list',
      body: { text: text },
      action: {
        button: buttonText,
        sections: sections,
      },
    };

    return this.sendInteractiveMessage(to, interactive);
  }

  async handleIncomingMessage(message, contacts) {
    try {
      const from = message.from;
      const messageType = message.type;
      const messageId = message.id;

      // Get or create user
      let user = await User.findOne({ where: { phoneNumber: from } });
      
      if (!user && contacts && contacts.length > 0) {
        const contact = contacts.find(c => c.wa_id === from);
        if (contact) {
          user = await User.create({
            phoneNumber: from,
            firstName: contact.profile?.name || 'User',
            lastName: '',
            isVerified: false,
          });
        }
      }

      // Get conversation state
      const conversationState = await this.getConversationState(from);

      // Handle different message types
      let response;
      switch (messageType) {
        case 'text':
          response = await conversationHandler.handleTextMessage(
            message.text.body,
            user,
            conversationState
          );
          break;
        case 'interactive':
          response = await conversationHandler.handleInteractiveMessage(
            message.interactive,
            user,
            conversationState
          );
          break;
        case 'location':
          response = await conversationHandler.handleLocationMessage(
            message.location,
            user,
            conversationState
          );
          break;
        default:
          response = {
            text: 'Sorry, I can only process text messages, buttons, and location sharing at the moment.',
          };
      }

      // Send response
      if (response) {
        if (response.text) {
          await this.sendTextMessage(from, response.text);
        }
        if (response.buttons) {
          await this.sendButtonMessage(from, response.text || 'Please choose:', response.buttons);
        }
        if (response.list) {
          await this.sendListMessage(from, response.text || 'Please select:', response.list.buttonText, response.list.sections);
        }
        if (response.template) {
          await this.sendTemplateMessage(from, response.template.name, response.template.language, response.template.components);
        }
      }

      // Update conversation state
      if (response && response.nextState) {
        await this.setConversationState(from, response.nextState);
      }

    } catch (error) {
      logger.error('Handle incoming message error:', error);
      
      // Send error message to user
      try {
        await this.sendTextMessage(message.from, 'Sorry, something went wrong. Please try again later.');
      } catch (sendError) {
        logger.error('Failed to send error message:', sendError);
      }
    }
  }

  async getConversationState(phoneNumber) {
    try {
      const state = await redisClient.get(`conversation:${phoneNumber}`);
      return state ? JSON.parse(state) : { step: 'welcome', data: {} };
    } catch (error) {
      logger.error('Get conversation state error:', error);
      return { step: 'welcome', data: {} };
    }
  }

  async setConversationState(phoneNumber, state) {
    try {
      await redisClient.setEx(
        `conversation:${phoneNumber}`,
        3600, // 1 hour expiry
        JSON.stringify(state)
      );
    } catch (error) {
      logger.error('Set conversation state error:', error);
    }
  }

  async clearConversationState(phoneNumber) {
    try {
      await redisClient.del(`conversation:${phoneNumber}`);
    } catch (error) {
      logger.error('Clear conversation state error:', error);
    }
  }
}

module.exports = new WhatsAppService();