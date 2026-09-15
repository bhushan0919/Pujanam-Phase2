// backend/middleware/bookingValidation.js - FIXED VERSION
const { body, validationResult } = require('express-validator');

exports.validateBooking = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  
  body('contact')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^\d{10}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  // serviceId: optional, validate only if present and non-empty
  body('serviceId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true; // null/undefined/empty — skip
      if (!/^[a-fA-F0-9]{24}$/.test(value)) {
        throw new Error('Invalid service ID');
      }
      return true;
    }),
  
  // panditId: optional, validate only if present and non-empty
  body('panditId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true; // null/undefined/empty — skip
      if (!/^[a-fA-F0-9]{24}$/.test(value)) {
        throw new Error('Invalid pandit ID');
      }
      return true;
    }),
  
  // Either serviceId or panditId must be provided
  body().custom((value, { req }) => {
    const { serviceId, panditId } = req.body;
    if (!serviceId && !panditId) {
      throw new Error('Either service or pandit selection is required');
    }
    return true;
  }),
  
  body('dateTime')
    .notEmpty()
    .withMessage('Date and time is required')
    .custom((value) => {
      const selectedDate = new Date(value);
      if (isNaN(selectedDate.getTime())) {
        throw new Error('Invalid date format');
      }
      // Allow 30-minute buffer to handle timezone differences (IST = UTC+5:30)
      const now = new Date(Date.now() - 30 * 60 * 1000);
      if (selectedDate <= now) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),
  
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Address must be between 3 and 500 characters')
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
        userMessage: 'Please check your input: ' + errorMessages.join(', ')
      });
    }
    next();
  }
];