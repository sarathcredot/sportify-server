const mongoose = require("mongoose");
const { NOTIFICATION_TYPES, NOTIFICATION_FOR } = require("../utils/constants");

const NotificationSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: false,
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },
    notificationFor: {
      type: String,
      required: true,
      enum: NOTIFICATION_FOR,
    },
    logoUrl: {
      type: String,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enam: NOTIFICATION_TYPES,
    },
    data: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
