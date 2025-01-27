const { validationResult } = require('express-validator');
const authService = require('../services/authService');

exports.sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, countryCode } = req.body;
    const result = await authService.initiateAuth(phoneNumber, countryCode);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, countryCode, otp } = req.body;
    const result = await authService.verifyOTP(phoneNumber, countryCode, otp);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};