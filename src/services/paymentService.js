const axios = require('axios');
const { Payment, Booking } = require('../models');
const logger = require('../utils/logger');

class PaymentService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackURL = process.env.MPESA_CALLBACK_URL;
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    
    this.baseURL = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('M-Pesa access token error:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  async initiatePayment({ bookingId, amount, phoneNumber }) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      // Format phone number (ensure it starts with 254)
      const formattedPhone = phoneNumber.startsWith('254') 
        ? phoneNumber 
        : phoneNumber.startsWith('0') 
          ? `254${phoneNumber.slice(1)}`
          : `254${phoneNumber}`;

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${this.callbackURL}`,
        AccountReference: `BOOKING-${bookingId}`,
        TransactionDesc: `Payment for booking ${bookingId}`,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.ResponseCode === '0') {
        // Create payment record
        await Payment.create({
          bookingId: bookingId,
          amount: amount,
          method: 'mpesa',
          status: 'pending',
          transactionId: response.data.CheckoutRequestID,
          phoneNumber: formattedPhone,
          metadata: {
            merchantRequestId: response.data.MerchantRequestID,
            checkoutRequestId: response.data.CheckoutRequestID,
          },
        });

        logger.info(`Payment initiated for booking ${bookingId}:`, response.data);

        return {
          success: true,
          message: 'Payment initiated successfully',
          data: {
            checkoutRequestId: response.data.CheckoutRequestID,
            merchantRequestId: response.data.MerchantRequestID,
          },
        };
      } else {
        logger.error('M-Pesa payment initiation failed:', response.data);
        return {
          success: false,
          message: response.data.ResponseDescription || 'Payment initiation failed',
        };
      }
    } catch (error) {
      logger.error('Payment initiation error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Payment initiation failed',
        error: error.message,
      };
    }
  }

  async handleMpesaCallback(callbackData) {
    try {
      const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = callbackData;

      // Find payment record
      const payment = await Payment.findOne({
        where: {
          transactionId: CheckoutRequestID,
        },
        include: [
          {
            model: Booking,
            as: 'booking',
          },
        ],
      });

      if (!payment) {
        logger.error(`Payment not found for CheckoutRequestID: ${CheckoutRequestID}`);
        return;
      }

      if (ResultCode === 0) {
        // Payment successful
        const callbackMetadata = callbackData.CallbackMetadata?.Item || [];
        const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;

        await payment.update({
          status: 'completed',
          mpesaReceiptNumber: mpesaReceiptNumber,
          processedAt: new Date(),
          metadata: {
            ...payment.metadata,
            callbackData: callbackData,
          },
        });

        // Update booking status
        await payment.booking.update({
          paymentStatus: 'paid',
          status: 'confirmed',
        });

        // Calculate platform fee and provider amount
        const platformFeeRate = 0.05; // 5% platform fee
        const platformFee = payment.amount * platformFeeRate;
        const providerAmount = payment.amount - platformFee;

        await payment.update({
          platformFee: platformFee,
          providerAmount: providerAmount,
        });

        logger.info(`Payment completed for booking ${payment.bookingId}: ${mpesaReceiptNumber}`);
      } else {
        // Payment failed
        await payment.update({
          status: 'failed',
          failureReason: ResultDesc,
          processedAt: new Date(),
        });

        await payment.booking.update({
          paymentStatus: 'failed',
        });

        logger.error(`Payment failed for booking ${payment.bookingId}: ${ResultDesc}`);
      }
    } catch (error) {
      logger.error('M-Pesa callback handling error:', error);
    }
  }

  async handleMpesaTimeout(timeoutData) {
    try {
      const { CheckoutRequestID } = timeoutData;

      const payment = await Payment.findOne({
        where: {
          transactionId: CheckoutRequestID,
        },
        include: [
          {
            model: Booking,
            as: 'booking',
          },
        ],
      });

      if (payment) {
        await payment.update({
          status: 'failed',
          failureReason: 'Payment timeout',
          processedAt: new Date(),
        });

        await payment.booking.update({
          paymentStatus: 'failed',
        });

        logger.info(`Payment timeout for booking ${payment.bookingId}`);
      }
    } catch (error) {
      logger.error('M-Pesa timeout handling error:', error);
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId, {
        include: [
          {
            model: Booking,
            as: 'booking',
          },
        ],
      });

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
        };
      }

      return {
        success: true,
        data: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          transactionId: payment.transactionId,
          mpesaReceiptNumber: payment.mpesaReceiptNumber,
          processedAt: payment.processedAt,
          booking: {
            id: payment.booking.id,
            status: payment.booking.status,
            paymentStatus: payment.booking.paymentStatus,
          },
        },
      };
    } catch (error) {
      logger.error('Get payment status error:', error);
      return {
        success: false,
        message: 'Failed to get payment status',
        error: error.message,
      };
    }
  }
}

module.exports = new PaymentService();