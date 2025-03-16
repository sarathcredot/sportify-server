const jwt = require('jsonwebtoken');
const { parsePhoneNumber } = require('libphonenumber-js');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

class AuthService {
  
  generateOTP() {
    // return '123456';
    return '12345';
    // return Math.floor(1000 + Math.random() * 9000).toString();
  }
  
  async sendOTP(phoneNumber, countryCode, otp) {
    try {
      // const message = await twilioClient.messages.create({
      //   body: `Your OTP for Auction App is: ${otp}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: `${countryCode}${phoneNumber}`
      // });
      // return message.sid;
    } catch (error) {
      throw new Error('Failed to send OTP');
    }
  }

  async initiateAuth(phoneNumber, countryCode) {
    try {
      // Validate phone number format
      const parsedNumber = parsePhoneNumber(phoneNumber, countryCode.replace('+', ''));
      if (!parsedNumber.isValid()) {
        throw new Error('Invalid phone number');
      }

      const normalizedPhone = parsedNumber.nationalNumber;
      
      const otp = this.generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      let user = await User.findOne({ phoneNumber: normalizedPhone });
      if (!user) {
        throw new Error('User not found');
      } else {
        user.otpData = {
          otp,
          expiresAt: otpExpiry
        };
      }
      await user.save();
      await this.sendOTP(normalizedPhone, countryCode, otp);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      throw new Error(error.message || 'Failed to initiate authentication');
    }
  }

  async verifyOTP(phoneNumber, countryCode, otp) {
    try {
      const parsedNumber = parsePhoneNumber(phoneNumber, countryCode.replace('+', ''));
      const normalizedPhone = parsedNumber.nationalNumber;

      const user = await User.findOne({ phoneNumber: normalizedPhone });
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.otpData || !user.otpData.otp) {
        throw new Error('No OTP request found');
      }

      if (new Date() > user.otpData.expiresAt) {
        throw new Error('OTP has expired');
      }

      if (user.otpData.otp !== otp) {
        throw new Error('Invalid OTP');
      }

      // Clear OTP and mark as verified
      user.otpData = undefined;
      user.isVerified = true;
      await user.save();

      const token = jwt.sign(
        { userId: user._id, phone: user.phoneNumber, name: user?.fullName },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  async register(phoneNumber, countryCode, fullName) {
    let user = await this.getUserByPhoneNumberAndRole(phoneNumber, countryCode, ROLES.ORGANISER);
    if (user) {
      throw new Error('User already exists');
    }
    user = new User({
      phoneNumber,
      countryCode,
      fullName,
      role: ROLES.ORGANISER
    });
    await user.save();
    return user;
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async getUserByPhoneNumberAndRole(phoneNumber, countryCode, role) {
    const user = await User.findOne({ phoneNumber: phoneNumber, countryCode: countryCode, role: role });
    return user;
  }
}

module.exports = new AuthService();