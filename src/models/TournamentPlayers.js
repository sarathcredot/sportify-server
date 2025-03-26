const mongoose = require("mongoose");
const { PLAYER_STATUS_TYPES, PLAYER_STATUS } = require("../utils/constants");

const TournamentPlayersSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  playerId: {
    type: String,
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentTeams'
  },
  currentBid: {
    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TournamentTeams'
    }
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