const mongoose = require("mongoose");
const { TEAM_STATUS_TYPES, TEAM_STATUS } = require("../utils/constants");

const TournamentTeamsSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true},
  email: { type: String },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  teamId: {
    type: String,
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: TEAM_STATUS_TYPES,
    default: TEAM_STATUS.PENDING
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  }],
  wonBids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bid",
  }],
  remainingPoints: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("TournamentTeams", TournamentTeamsSchema); 