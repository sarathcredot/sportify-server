const express = require('express');
const { sendOTP, verifyOTP, register } = require('../controllers/authController');
const validate = require('../utils/validate');  
const { sendOTPSchema, verifyOTPSchema, registerSchema } = require('../schemas/authSchema');

const router = express.Router();

router.post(
  '/send-otp',
  validate(sendOTPSchema),
  sendOTP
);

router.post(
  '/register',
  validate(registerSchema),
  register
);

router.post(
  '/verify-otp',
  validate(verifyOTPSchema),
  verifyOTP
);

module.exports = router;