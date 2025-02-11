const mongoose = require('mongoose');
const { PLAYER_AUCTION_STATUS_TYPES, AUCTION_STATUS_TYPES } = require('../utils/constants');

const auctionSchema = new mongoose.Schema({
  auctionDate: { type: Date, required: true },
  auctionTime: { type: String, required: true },
  auctionLocation: { type: String, required: true },
  biddingPointPerTeam: { type: Number, required: true },
  minBidPerPlayer: { type: Number, required: true },
  maxBidPerPlayer: { type: Number, required: true },
  bidIncreaseBy: { type: Number, required: true },
  biddingTimerLimit: { type: Number, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: AUCTION_STATUS_TYPES,
    default: 'upcoming'
  },
  players: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    currentBid: {
      amount: Number,
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      },
      bidTime: { type: Date }
    },
    status: {
      type: String,
      enum: PLAYER_AUCTION_STATUS_TYPES,
      default: 'available'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Auction', auctionSchema);