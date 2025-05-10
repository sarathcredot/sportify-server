const mongoose = require("mongoose");
const { TEMPLATE_TYPES } = require("../utils/constants");

const templateSchema = new mongoose.Schema(
  {
    templateType: { type: String, required: true, enum: TEMPLATE_TYPES },
    templateData: { type: String, required: true },
    templateFileUrl: { type: String, required: true },
    fields: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Template", templateSchema);
