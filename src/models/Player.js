const mongoose = require("mongoose");
const { SPORT_TYPES, PLAYER_STATUS_TYPES } = require("../utils/constants");

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: String, required: true, enum: SPORT_TYPES },
    basePrice: { type: Number, required: true},
    skills: [{ type: String, },],
    stats: { type: Map, of: Number,},
    status: { 
      type: String, 
      enum: PLAYER_STATUS_TYPES, 
      default: PLAYER_STATUS_TYPES[0]
    },
    currentTeam: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    tournament: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Player", playerSchema);
