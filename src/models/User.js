const mongoose = require('mongoose');

const USER_TYPES = ["organiser", "admin", "player"];

const userSchema = new mongoose.Schema({
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
    default: 'organiser'
  },
  otpData: {
    otp: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);