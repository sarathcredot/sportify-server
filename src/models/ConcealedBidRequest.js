const mongoose = require("mongoose");
const { CONCEALED_BID_REQUEST_STATUS, CONCEALED_BID_REQUEST_STATUS_TYPES } = require("../utils/constants");

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
      enum: CONCEALED_BID_REQUEST_STATUS_TYPES,
      default: CONCEALED_BID_REQUEST_STATUS.REQUESTED,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ConcealedBidRequest", ConcealedBidRequestSchema);
