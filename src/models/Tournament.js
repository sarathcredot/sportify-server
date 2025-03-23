const mongoose = require("mongoose");

const {
  SPORT_TYPES,
  CRICKET_MATCH_TYPES,
  FOOTBALL_MATCH_TYPES,
  CRICKET_BALL_TYPES,
  FOOTBALL_BALL_TYPES,
  SPORTS_NAMES,
  TEAM_STATUS_TYPES,
  TEAM_STATUS,
  PLAYER_STATUS_TYPES,
  PLAYER_STATUS,
} = require("../utils/constants");

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  logoUrl: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  sportType: {
    type: String,
    enum: SPORT_TYPES,
    required: true,
  },
  location: { type: String, required: true },
  ground: { type: String, required: true },
  settings: {
    matchType: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (this.sportType === SPORTS_NAMES.CRICKET) {
            return Object.values(CRICKET_MATCH_TYPES).includes(value);
          } else if (this.sportType === SPORTS_NAMES.FOOTBALL) {
            return Object.values(FOOTBALL_MATCH_TYPES).includes(value);
          }
          return false;
        },
        message: (props) =>
          `${props.value} is not a valid match type for the selected sport type`,
      },
    },
    ballType: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (this.sportType === SPORTS_NAMES.CRICKET) {
            return Object.values(CRICKET_BALL_TYPES).includes(value);
          } else if (this.sportType === SPORTS_NAMES.FOOTBALL) {
            return Object.values(FOOTBALL_BALL_TYPES).includes(value);
          }
          return false;
        },
        message: (props) =>
          `${props.value} is not a valid ball type for the selected sport type`,
      },
    },
    overs: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.matchType === CRICKET_MATCH_TYPES.LIMITED_OVER && !value) {
            return false;
          }
          return true;
        },
        message: (props) =>
          `${props.value} is required if match type is limited over`,
      },
    },
    auctionEnabled: { type: Boolean, default: false },
    maxTeamAllowed: { type: Number, required: true },
    maxPlayersPerTeam: { type: Number, required: true },
    teamRegistrationFeeEnabled: { type: Boolean, default: false },
    playerRegistrationFeeEnabled: { type: Boolean, default: false },
    teamRegistrationFee: {
      type: Number,
      validate: {
        validator: function (value) {
          if (this.teamRegistrationFeeEnabled && value <= 0) {
            return false;
          }
          return true;
        },
        message: (props) =>
          `${props.value} is required if Team registration fee enabled.`,
      },
    },
    playerRegistrationFee: {
      type: Number,
      validate: {
        validator: function (value) {
          if (this.playerRegistrationFeeEnabled && value <= 0) {
            return false;
          }
          return true;
        },
        message: (props) =>
          `${props.value} is required if Player registration fee enabled.`,
      },
    },
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: function() {
      return this.settings.auctionEnabled;
    }
  },
  organiserDetails: {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    alternatePhoneNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  playerIdCounter: {
    type: Number,
    default: 0
  },
  playerIdPrefix: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual fields for both players and teams
TournamentSchema.virtual('players', {
  ref: 'TournamentPlayers',
  localField: '_id',
  foreignField: 'tournament'
});

TournamentSchema.virtual('teams', {
  ref: 'TournamentTeams',
  localField: '_id',
  foreignField: 'tournament'
});

module.exports = mongoose.model("Tournament", TournamentSchema);
