const mongoose = require("mongoose");
const { TEAM_STATUS_TYPES, TEAM_STATUS } = require("../utils/constants");

const TournamentTeamsSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
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
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("TournamentTeams", TournamentTeamsSchema); 