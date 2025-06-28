const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^(\+254|254|0)?[17]\d{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid Kenyan phone number',
      }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required(),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message),
    });
  }

  // Normalize phone number
  let { phoneNumber } = req.body;
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '254' + phoneNumber.slice(1);
  } else if (phoneNumber.startsWith('+254')) {
    phoneNumber = phoneNumber.slice(1);
  }
  req.body.phoneNumber = phoneNumber;

  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^(\+254|254|0)?[17]\d{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid Kenyan phone number',
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message),
    });
  }

  // Normalize phone number
  let { phoneNumber } = req.body;
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '254' + phoneNumber.slice(1);
  } else if (phoneNumber.startsWith('+254')) {
    phoneNumber = phoneNumber.slice(1);
  }
  req.body.phoneNumber = phoneNumber;

  next();
};

const validateOTP = (req, res, next) => {
  const schema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^(\+254|254|0)?[17]\d{8}$/)
      .required(),
    otp: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': 'OTP must be 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message),
    });
  }

  // Normalize phone number
  let { phoneNumber } = req.body;
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '254' + phoneNumber.slice(1);
  } else if (phoneNumber.startsWith('+254')) {
    phoneNumber = phoneNumber.slice(1);
  }
  req.body.phoneNumber = phoneNumber;

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateOTP,
};