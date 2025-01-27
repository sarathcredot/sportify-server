const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'football']
  },
  basePrice: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }],
  stats: {
    type: Map,
    of: Number
  },
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'unsold'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);