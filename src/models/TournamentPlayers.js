const mongoose = require("mongoose");
const { PLAYER_STATUS_TYPES, PLAYER_STATUS } = require("../utils/constants");

const TournamentPlayersSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  playerId: String,
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
    enum: PLAYER_STATUS_TYPES,
    default: PLAYER_STATUS.PENDING,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("TournamentPlayers", TournamentPlayersSchema); 