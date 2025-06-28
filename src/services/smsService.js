const AfricasTalking = require('africastalking');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.client = AfricasTalking({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME,
    });
    this.sms = this.client.SMS;
  }

  async sendOTP(phoneNumber, otp) {
    try {
      // Format phone number for Kenya
      const formattedPhone = phoneNumber.startsWith('+254') 
        ? phoneNumber 
        : phoneNumber.startsWith('254') 
          ? `+${phoneNumber}`
          : phoneNumber.startsWith('0') 
            ? `+254${phoneNumber.slice(1)}`
            : `+254${phoneNumber}`;

      const message = `Your Fundis & Freelancers verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`;

      const result = await this.sms.send({
        to: formattedPhone,
        message: message,
        from: 'FUNDIS', // Your sender ID
      });

      if (result.SMSMessageData.Recipients[0].status === 'Success') {
        logger.info(`OTP sent successfully to ${formattedPhone}`);
        return {
          success: true,
          message: 'OTP sent successfully',
        };
      } else {
        logger.error(`Failed to send OTP to ${formattedPhone}:`, result);
        return {
          success: false,
          message: 'Failed to send OTP',
        };
      }
    } catch (error) {
      logger.error('SMS service error:', error);
      return {
        success: false,
        message: 'SMS service error',
        error: error.message,
      };
    }
  }

  async sendBookingConfirmation(phoneNumber, bookingDetails) {
    try {
      const formattedPhone = phoneNumber.startsWith('+254') 
        ? phoneNumber 
        : phoneNumber.startsWith('254') 
          ? `+${phoneNumber}`
          : phoneNumber.startsWith('0') 
            ? `+254${phoneNumber.slice(1)}`
            : `+254${phoneNumber}`;

      const message = `Booking confirmed! Service: ${bookingDetails.service}, Date: ${bookingDetails.date}, Provider: ${bookingDetails.provider}. Booking ID: ${bookingDetails.bookingId}`;

      const result = await this.sms.send({
        to: formattedPhone,
        message: message,
        from: 'FUNDIS',
      });

      logger.info(`Booking confirmation sent to ${formattedPhone}`);
      return result;
    } catch (error) {
      logger.error('Booking confirmation SMS error:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(phoneNumber, paymentDetails) {
    try {
      const formattedPhone = phoneNumber.startsWith('+254') 
        ? phoneNumber 
        : phoneNumber.startsWith('254') 
          ? `+${phoneNumber}`
          : phoneNumber.startsWith('0') 
            ? `+254${phoneNumber.slice(1)}`
            : `+254${phoneNumber}`;

      const message = `Payment received! Amount: KES ${paymentDetails.amount}, Receipt: ${paymentDetails.receipt}, Booking: ${paymentDetails.bookingId}. Thank you!`;

      const result = await this.sms.send({
        to: formattedPhone,
        message: message,
        from: 'FUNDIS',
      });

      logger.info(`Payment confirmation sent to ${formattedPhone}`);
      return result;
    } catch (error) {
      logger.error('Payment confirmation SMS error:', error);
      throw error;
    }
  }
}

module.exports = new SMSService();