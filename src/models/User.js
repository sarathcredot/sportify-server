const mongoose = require('mongoose');
const { USER_TYPES, ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: function () {
      return this.role === ROLES.ADMIN;
    },
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return this.role === ROLES.ADMIN;
    },
    minlength: 6
  },
  phoneNumber: {
    type: String,
    required: function () {
      return this.role !== ROLES.ADMIN;
    },
    unique: true,
    trim: true
  },
  photoUrl: {

    type: String

  },
  countryCode: {
    type: String,
    required: function () {
      return this.role !== ROLES.ADMIN;
    },
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
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);