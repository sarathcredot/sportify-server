// User roles and types
const ROLES = {
  TEAM_MANAGER: "team_manager",
  ORGANISER: "organiser",
  ADMIN: "admin",
  PLAYER: "player"
};

const USER_TYPES = Object.values(ROLES);

// Sport-related constants

const SPORTS_NAMES = {
  CRICKET: "cricket",
  FOOTBALL: "football"
};

const CRICKET_MATCH_TYPES = {
  TEST_MATCH: "test_match",
  LIMITED_OVER: "limited_over"
};

const FOOTBALL_MATCH_TYPES = {
  MUD_FOOTBALL: "mud_football",
  TURF_FOOTBALL: "turf_football"
};

const CRICKET_BALL_TYPES = {
  TENNIS: "tennis",
  LEATHER: "leather",
  OTHER: "other"
};

const FOOTBALL_BALL_TYPES = {
  MATCH: "match",
  FUTSAL: "futsal",
  TRAINING: "training"
};

const CRICKET_PLAYER_CATEGORIES = {
  BATSMAN: "batsman",
  BOWLER: "bowler",
  ALL_ROUNDER: "all_rounder",
  WICKET_KEEPER: "wicket_keeper"
};

const FOOTBALL_PLAYER_CATEGORIES = {
  GOALKEEPER: "goalkeeper",
  DEFENDER: "defender",
  MIDFIELDER: "midfielder",
  FORWARD: "forward"
};

const SPORTS = {
  CRICKET: {
    NAME: SPORTS_NAMES.CRICKET,
    MATCH_TYPES: Object.values(CRICKET_MATCH_TYPES),
    BALL_TYPES: Object.values(CRICKET_BALL_TYPES),
    PLAYER_CATEGORIES: Object.values(CRICKET_PLAYER_CATEGORIES)
  },
  FOOTBALL: {
    NAME: SPORTS_NAMES.FOOTBALL,
    MATCH_TYPES: Object.values(FOOTBALL_MATCH_TYPES),
    BALL_TYPES: Object.values(FOOTBALL_BALL_TYPES),
    PLAYER_CATEGORIES: Object.values(FOOTBALL_PLAYER_CATEGORIES)
  }
};

const SPORT_TYPES = Object.values(SPORTS).map(sport => sport.NAME);

// Team status constants
const TEAM_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

const TEAM_STATUS_TYPES = Object.values(TEAM_STATUS);

// Player status constants
const PLAYER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

const PLAYER_STATUS_TYPES = Object.values(PLAYER_STATUS);

const PLAYER_AUCTION_STATUS = {
  AVAILABLE: "available",
  SOLD: "sold",
  UNSOLD: "unsold"
};

const PLAYER_AUCTION_STATUS_TYPES = Object.values(PLAYER_AUCTION_STATUS);

// Auction status constants
const AUCTION_STATUS = {
  UPCOMING: "upcoming",
  LIVE: "live",
  COMPLETED: "completed"
};

const AUCTION_STATUS_TYPES = Object.values(AUCTION_STATUS);
// Other constants
const OTP_LENGTH = 6;
const ALLOWED_UPLOAD_FOLDERS = ["tournaments", "players", "teams", "images"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/tiff"];


module.exports = {
  OTP_LENGTH,
  SPORT_TYPES,
  SPORTS,
  ROLES,
  USER_TYPES,
  PLAYER_STATUS_TYPES,
  PLAYER_AUCTION_STATUS_TYPES,
  ALLOWED_UPLOAD_FOLDERS,
  ALLOWED_IMAGE_TYPES,
  AUCTION_STATUS_TYPES,
  TEAM_STATUS,
  TEAM_STATUS_TYPES,
  PLAYER_STATUS,
  AUCTION_STATUS,
  CRICKET_MATCH_TYPES,
  FOOTBALL_MATCH_TYPES,
  CRICKET_BALL_TYPES,
  FOOTBALL_BALL_TYPES,
  PLAYER_AUCTION_STATUS,
  PLAYER_STATUS_TYPES,
  TEAM_STATUS_TYPES,
  TEAM_STATUS,
  PLAYER_STATUS,
  AUCTION_STATUS,
  CRICKET_PLAYER_CATEGORIES,
  FOOTBALL_PLAYER_CATEGORIES,
  SPORTS_NAMES,
  CRICKET_MATCH_TYPES,
  FOOTBALL_MATCH_TYPES,
  CRICKET_BALL_TYPES,
  FOOTBALL_BALL_TYPES,
};
