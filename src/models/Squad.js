const mongoose = require("mongoose");


const squadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    teamManager: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamManagerPlayer",
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Squad", squadSchema);
