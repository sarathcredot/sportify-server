const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'football']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
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
      }
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'sold', 'unsold'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Auction', auctionSchema);