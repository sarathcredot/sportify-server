const mongoose = require("mongoose");

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

}, {
  timestamps: true
});

module.exports = mongoose.model("Clipboard", Clipboard);
