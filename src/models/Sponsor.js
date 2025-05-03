const mongoose = require("mongoose");
const { SPONSOR_TYPES_VALUES } = require("../utils/constants");

const sponsorSchema = new mongoose.Schema(
  {
    logoUrl: { type: String },
    name: { type: String, required: true },
    websiteUrl: { type: String },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    type: { type: String, enum: SPONSOR_TYPES_VALUES, required: true }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sponsor", sponsorSchema);
