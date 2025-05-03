const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentPlayers',
    required: true
  },
  placedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentTeams',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  concealedBidRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConcealedBidRequest',
  },
  isConcealedBid: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

const ConcealedBidRequestSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentPlayers',
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'bids-placed', 'completed'],
    default: 'requested'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Bid', BidSchema);