const mongoose = require("mongoose");
const { TEAM_STATUS_TYPES, TEAM_STATUS } = require("../utils/constants");

const TournamentTeamsSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true },
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
  players: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TournamentPlayers",
      },
      signedForPoints: {
        type: Number,
        default: 0,
      }
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

TournamentTeamsSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'placedBy'
});
TournamentTeamsSchema.set('toObject', { virtuals: true });
TournamentTeamsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("TournamentTeams", TournamentTeamsSchema); 