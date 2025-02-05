const mongoose = require("mongoose");

const { SPORT_TYPES, CRICKET_MATCH_TYPES, FOOTBALL_MATCH_TYPES, CRICKET_BALL_TYPES, FOOTBALL_BALL_TYPES } = require('../utils/constants');

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  logoUrl: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  sportType: {
    type: String,
    enum: SPORT_TYPES,
    required: true,
  },
  location: { type: String, required: true },
  ground: { type: String, required: true },
  settings: {
    matchType: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (this.sportType === "cricket") {
            return CRICKET_MATCH_TYPES.includes(value);
          } else if (this.sportType === "football") {
            return FOOTBALL_MATCH_TYPES.includes(value);
          }
          return false;
        },
        message: (props) =>
          `${props.value} is not a valid match type for the selected sport type`,
      },
    },
    ballType: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (this.sportType === "cricket") {
            return CRICKET_BALL_TYPES.includes(value);
          } else if (this.sportType === "football") {
            return FOOTBALL_BALL_TYPES.includes(value);
          }
          return false;
        },
        message: (props) =>
          `${props.value} is not a valid ball type for the selected sport type`,
      },
    },
    overs: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.matchType === "limited_over" && !value) {
            return false;
          }
          return true;
        },
        message: (props) =>
          `${props.value} is required if match type is limited over`,
      },
    },
    auctionEnabled: { type: Boolean, default: false },
    maxTeamAllowed: { type: Number, required: true },
    maxPlayersPerTeam: { type: Number, required: true },
    teamRegistrationFeeEnabled: { type: Boolean, default: false },
    playerRegistrationFeeEnabled: { type: Boolean, default: false },
  },
  auction: {
    auctionDate: { type: Date },
    auctionTime: { type: String },
    auctionLocation: { type: String },
    biddingPointPerTeam: { type: Number },
    minBidPerPlayer: { type: Number },
    maxBidPerPlayer: { type: Number },
    bidIncreaseBy: { type: Number },
    biddingTimerLimit: { type: Number },
    message: { type: String },
  },
  organiserDetails: {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    alternatePhoneNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tournament", TournamentSchema);