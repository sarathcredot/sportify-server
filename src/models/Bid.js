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
}, {
  timestamps: true
});

module.exports = mongoose.model('Bid', BidSchema);