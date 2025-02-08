const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema(
  {
    logoUrl: { type: String },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, trim: true },
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

module.exports = mongoose.model("Sponsor", sponsorSchema);
