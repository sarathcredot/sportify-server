const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/send-otp',
  [
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('countryCode').notEmpty().withMessage('Country code is required')
  ],
  authController.sendOTP
);

router.post(
  '/verify-otp',
  [
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('countryCode').notEmpty().withMessage('Country code is required'),
    body('otp').notEmpty().withMessage('OTP is required').isLength({ min: 4, max: 4 })
  ],
  authController.verifyOTP
);

module.exports = router;