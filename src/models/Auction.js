const mongoose = require("mongoose");
const {
  PLAYER_AUCTION_STATUS_TYPES,
  AUCTION_STATUS_TYPES,
  PLAYER_AUCTION_STATUS,
  AUCTION_STATUS,
  TEAM_STATUS_TYPES,
  TEAM_STATUS,
} = require("../utils/constants");

const auctionSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    auctionDate: { type: Date },
    auctionTime: { type: String },
    auctionLocation: { type: String },
    biddingPointPerTeam: { type: Number },
    minBidPerPlayer: { type: Number },
    maxBidPerPlayer: { type: Number },
    bidIncreaseBy: { type: Number },
    biddingTimerLimit: { type: String },
    message: { type: String },
    status: {
      type: String,
      enum: AUCTION_STATUS_TYPES,
      default: AUCTION_STATUS.UPCOMING,
    },
    auctionStartedAt: { type: Date },
    auctionEndedAt: { type: Date },
    currentBiddingPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentPlayers",
    },
    concealedBidRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConcealedBidRequest",
    },
    auctionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionPlan",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Auction", auctionSchema);
