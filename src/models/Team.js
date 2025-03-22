const mongoose = require("mongoose");
const { TEAM_STATUS_TYPES, TEAM_STATUS } = require("../utils/constants");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true},
    logoUrl: { type: String, required: true},
    phoneNumber: { type: String, required: true},
    email: { type: String },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Team", teamSchema);
