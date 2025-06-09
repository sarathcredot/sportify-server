const mongoose = require("mongoose");
const { POSTER_PLAN_INCLUDES, PLANS_TYPES } = require("../utils/constants");

const posterPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: Object.keys(PLANS_TYPES),
      unique: true,
    }, // Name of the poster plan
    type: {
      type: String,
      required: true,
      enum: Object.values(PLANS_TYPES),
      unique: true,
    }, // Name of the poster plan
    description: { type: String }, // Description of the poster plan
    price: { type: Number, required: true }, // Price of the poster plan
    includes: [String],
    includesEnum: [
      {
        type: String,
        enum: Object.keys(POSTER_PLAN_INCLUDES),
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

posterPlanSchema.pre("validate", function (next) {
  const PLAN_INCLUDES_BY_TYPE_ENUM = {
    [PLANS_TYPES.STARTER]: Object.keys(POSTER_PLAN_INCLUDES).slice(0, 3),
    [PLANS_TYPES.BASIC]: Object.keys(POSTER_PLAN_INCLUDES).slice(0, 6),
    [PLANS_TYPES.PRO]: Object.keys(POSTER_PLAN_INCLUDES),
  };

  const PLAN_INCLUDES_BY_TYPE = {
    [PLANS_TYPES.STARTER]: Object.values(POSTER_PLAN_INCLUDES).slice(0, 3),
    [PLANS_TYPES.BASIC]: [
      "Everything in Starter Plan",
      ...Object.values(POSTER_PLAN_INCLUDES).slice(3, 6),
    ],
    [PLANS_TYPES.PRO]: [
      "Everything in Basic Plan",
      ...Object.values(POSTER_PLAN_INCLUDES).slice(6),
    ],
  };

  const allowedIncludesEnum = PLAN_INCLUDES_BY_TYPE_ENUM[this.type];
  const allowedIncludes = PLAN_INCLUDES_BY_TYPE[this.type];

  if (
    (!allowedIncludes && allowedIncludes?.length === 0) ||
    (!allowedIncludesEnum && allowedIncludesEnum?.length === 0)
  ) {
    return next(new Error(`Invalid plan type: ${this.type}`));
  }

  this.includes = allowedIncludes;
  this.includesEnum = allowedIncludesEnum;

  next();
});

module.exports = mongoose.model("PosterPlan", posterPlanSchema);
