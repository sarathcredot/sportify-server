const mongoose = require('mongoose');

const auctionPlanSchema = new mongoose.Schema({
  maxAllowedTeams: { type: Number, required: true }, // Maximum number of teams allowed in the auction
  price: { type: Number, required: true }, // Price of the auction plan
  isFree: { type: Boolean, default: false }, // Whether the plan is free or not
  isUnlimitedTeamsAllowed: { type: Boolean, default: false }, // Whether unlimited teams are allowed in the auction
  isActive: { type: Boolean, default: true } // Whether the auction plan is active or not
}, {
  timestamps: true
});

module.exports = mongoose.model('AuctionPlan', auctionPlanSchema);