const express = require('express');
const { sendOTP, verifyOTP } = require('../controllers/authController');
const validate = require('../utils/validate');  
const { sendOTPSchema, verifyOTPSchema } = require('../schemas/authSchema');

const router = express.Router();

router.post(
  '/send-otp',
  validate(sendOTPSchema),
  sendOTP
);

router.post(
  '/verify-otp',
  validate(verifyOTPSchema),
  verifyOTP
);

module.exports = router;