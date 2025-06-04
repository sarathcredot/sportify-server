const mongoose = require("mongoose");
const { PLANS_TYPES } = require("../utils/constants");

const Clipboard = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["team", "tournament"],
  },
  type: {
    type: String,
    enum: ["logo", "banner"],
    required: true,
  },
   availableForPlan: {
    type: String,
    enum: Object.values(PLANS_TYPES),
    required: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Clipboard", Clipboard);
