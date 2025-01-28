const mongoose = require("mongoose");

const SPORT_TYPES = ["cricket", "women_cricket", "football", "women_football"];

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  sportType: {
    type: String,
    enum: SPORT_TYPES,
    required: true,
  },
  location: { type: String, required: true },
  ground: { type: String },
  playersPerTeam: { type: Number, required: true },
  // announcementTemplate: { type: String },
  registrationFee: { type: Number },
  teamGroundFee: { type: Number },
  auction: {
    enabled: { type: Boolean, default: false },
    playerRegistrationFee: { type: Number },
    auctionDate: { type: Date },
    auctionTime: { type: String },
    auctionLocation: { type: String },
  },
  registrationLinks: {
    player: { type: String },
    team: { type: String },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Tournament", TournamentSchema);
