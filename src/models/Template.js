const mongoose = require("mongoose");
const { TEMPLATE_TYPES, PLANS_TYPES } = require("../utils/constants");

const templateSchema = new mongoose.Schema(
  {
    templateType: { type: String, required: true, enum: TEMPLATE_TYPES },
    templateData: { type: String, required: true },
    templateFileUrl: { type: String, required: true },
    fields: {
      type: [
        {
          key: { type: String },
          value: { type: String },
        },
      ],
      default: [],
    },
    availableForPlan: {
      type: String,
      enum: Object.values(PLANS_TYPES),
      default: PLANS_TYPES.STARTER,
    },
    isFree: { type: Boolean, required: true, default: false },
    thumbnail: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Template", templateSchema);
