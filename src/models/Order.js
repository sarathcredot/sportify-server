const mongoose = require("mongoose");
const { ORDER_STATUS, ORDER_TYPE } = require("../utils/constants");

const orderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(ORDER_TYPE),
    },
    status: {
      type: String,
      default: ORDER_STATUS.PENDING,
      enum: Object.values(ORDER_STATUS),
    },
    paymentDetails: {
      paymentId: {
        type: String,
      },
      status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
      },
      paymentMethod: {
        type: String,
      },
      amount: {
        type: Number,
      },
      currency: {
        type: String,
      },
    },
    auctionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionPlan",
    },
    posterPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PosterPlan",
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Add conditional validation
orderSchema.pre("validate", function (next) {
  if (this.type === ORDER_TYPE.AUCTION_PLAN && !this.auctionPlan) {
    return next(new Error("auctionPlan is required for auction_plan orders"));
  }

  if (this.type === ORDER_TYPE.POSTER_PLAN && !this.posterPlan) {
    return next(new Error("posterPlan is required for poster_plan orders"));
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
