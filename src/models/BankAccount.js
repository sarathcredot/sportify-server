const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountHolderName: { type: String, required: true }, // Must match bank records
    accountNumber: { type: String, required: true },
    accountType: { type: String, enum: ["savings", "current"], required: true }, // Savings or Current account
    ifscCode: { type: String, required: true }, // For Indian banks
    bankName: { type: String, required: true },
    branchName: { type: String },
    currency: { type: String, default: "INR", enum: ["INR", "USD", "EUR"] }, // Supported currencies
    isInternational: { type: Boolean, default: false }, // For foreign bank accounts
    swiftCode: { type: String }, // Required for international transfers
    iban: { type: String }, // For European banks
    razorpayContactId: { type: String }, // Razorpay contact ID
    razorpayFundAccountId: { type: String }, // Razorpay fund account ID
    accountVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
    panNumber: { type: String, required: true }, // For Indian organizers
    gstin: { type: String }, // If applicable
    taxResidency: { type: String }, // For international organizers
    isPrimary: { type: Boolean, default: true }, // Flag for primary account
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BankAccount", accountSchema);
