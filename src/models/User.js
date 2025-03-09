const mongoose = require('mongoose');
const { USER_TYPES, ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  countryCode: {
    type: String,
    required: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: USER_TYPES,
    default: ROLES.ORGANISER
  },
  otpData: {
    otp: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);