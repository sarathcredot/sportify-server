const mongoose = require("mongoose");
const { POSTER_PLAN_INCLUDES, PLANS_TYPES } = require("../utils/constants");

const posterPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, enum: Object.keys(PLANS_TYPES), unique: true }, // Name of the poster plan
    type: { type: String, required: true, enum: Object.values(PLANS_TYPES), unique: true }, // Name of the poster plan
    description: { type: String }, // Description of the poster plan
    price: { type: Number, required: true }, // Price of the poster plan
    includes: [String],
    includesEnum: [{
        type: String,
        enum: Object.keys(POSTER_PLAN_INCLUDES)
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PosterPlan", posterPlanSchema);
