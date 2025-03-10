const express = require('express');
const { sendOTP, verifyOTP, register } = require('../controllers/authController');
const validate = require('../utils/validate');  
const { sendOTPSchema, verifyOTPSchema, registerSchema } = require('../schemas/authSchema');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send a one-time password (OTP) to the user's phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               countryCode:
 *                 type: string
 *                 description: The user's country code
 *                 example: "IN"
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number
 *                 example: "8100000000"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad Request - Invalid phone number format
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/send-otp',
  validate(sendOTPSchema),
  sendOTP
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number
 *                 example: "8100000000"
 *               countryCode:
 *                 type: string
 *                 description: The user's country code
 *                 example: "IN"
 *               fullName:
 *                 type: string
 *                 description: The user's full name
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/register',
  validate(registerSchema),
  register
);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify the OTP sent to the user's phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number
 *                 example: "8100000000"
 *               countryCode:
 *                 type: string
 *                 description: The user's country code
 *                 example: "IN"
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's phone number
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/verify-otp',
  validate(verifyOTPSchema),
  verifyOTP
);

module.exports = router;