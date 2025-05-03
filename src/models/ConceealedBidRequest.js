const mongoose = require("mongoose");

const ConcealedBidRequestSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentPlayers",
      required: true,
    },
    status: {
      type: String,
      enum: ["requested", "bids-placed", "completed"],
      default: "requested",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ConcealedBidRequest", ConcealedBidRequestSchema);
