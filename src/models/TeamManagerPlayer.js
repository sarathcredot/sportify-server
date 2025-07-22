const mongoose = require("mongoose");

const teamManagerPlayerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    notes: { type: String },
    teamManager: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TeamManagerPlayer", teamManagerPlayerSchema);
