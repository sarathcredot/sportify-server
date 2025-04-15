const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const ResponseHandler = require('../utils/responseHandler');

exports.sendOTP = async (req, res) => {
  try {
    console.log("auth req")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { phoneNumber, countryCode } = req.body;
    const result = await authService.initiateAuth(phoneNumber, countryCode);
    res.json(ResponseHandler.success("OTP sent successfully", result));
  } catch (error) {
    console.log("auth error 2",error)
    this.handleError(res, error);
  }
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, countryCode, fullName } = req.body;
    await authService.register(phoneNumber, countryCode, fullName);
    const result = await authService.initiateAuth(phoneNumber, countryCode);
    res.json(ResponseHandler.success("User registered successfully", result));
  } catch (error) {
    this.handleError(res, "User registration failed", error);
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
    res.json(ResponseHandler.success("OTP verified successfully", result));
  } catch (error) {
    this.handleError(res, "OTP verification failed", error);
  }
};

exports.handleError = (res, message, error) => {
  
  const errorMap = {
    ValidationError: 400,
    NotFoundError: 404,
    UnauthorizedError: 401,
  };
  
  const statusCode = errorMap[error.name] || 500;
  res.status(statusCode).json(
    ResponseHandler.error(message, error.message, statusCode)
  );
}