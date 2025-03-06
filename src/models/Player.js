const mongoose = require("mongoose");
const { SPORT_TYPES, PLAYER_STATUS_TYPES, PLAYER_STATUS } = require("../utils/constants");

const playerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    playerCategory: { type: String, required: true },
    sport: { type: String, required: true, enum: SPORT_TYPES },
    cricHeroesId: { type: String },
    notes: { type: String },
    stats: { type: Map, of: Number },
    currentTeam: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Player", playerSchema);
