// User roles and types
const ROLES = {
  TEAM_MANAGER: "team_manager",
  ORGANISER: "organiser",
  ADMIN: "admin",
  PLAYER: "player",
};

const USER_TYPES = Object.values(ROLES);

// Sport-related constants

const SPORTS_NAMES = {
  CRICKET: "cricket",
  FOOTBALL: "football",
};

const CRICKET_MATCH_TYPES = {
  TEST_MATCH: "test_match",
  LIMITED_OVER: "limited_over",
};

const FOOTBALL_MATCH_TYPES = {
  MUD_FOOTBALL: "mud_football",
  TURF_FOOTBALL: "turf_football",
};

const CRICKET_BALL_TYPES = {
  TENNIS: "tennis",
  LEATHER: "leather",
  OTHER: "other",
};

const FOOTBALL_BALL_TYPES = {
  MATCH: "match",
  FUTSAL: "futsal",
  TRAINING: "training",
};

const CRICKET_PLAYER_CATEGORIES = {
  BATSMAN: "batsman",
  BOWLER: "bowler",
  ALL_ROUNDER: "all_rounder",
  WICKET_KEEPER: "wicket_keeper",
};

const FOOTBALL_PLAYER_CATEGORIES = {
  GOALKEEPER: "goalkeeper",
  DEFENDER: "defender",
  MIDFIELDER: "midfielder",
  FORWARD: "forward",
};

const SPORTS = {
  CRICKET: {
    NAME: SPORTS_NAMES.CRICKET,
    MATCH_TYPES: Object.values(CRICKET_MATCH_TYPES),
    BALL_TYPES: Object.values(CRICKET_BALL_TYPES),
    PLAYER_CATEGORIES: Object.values(CRICKET_PLAYER_CATEGORIES),
  },
  FOOTBALL: {
    NAME: SPORTS_NAMES.FOOTBALL,
    MATCH_TYPES: Object.values(FOOTBALL_MATCH_TYPES),
    BALL_TYPES: Object.values(FOOTBALL_BALL_TYPES),
    PLAYER_CATEGORIES: Object.values(FOOTBALL_PLAYER_CATEGORIES),
  },
};

const SPORT_TYPES = Object.values(SPORTS).map((sport) => sport.NAME);

// Team status constants
const TEAM_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REFUNDED: "refunded",
};

const PLAYER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  BIDDING: "bidding",
  SOLD: "sold",
  UNSOLD: "unsold",
  REFUNDED: "refunded",
};

const TEAM_STATUS_TYPES = Object.values(TEAM_STATUS);

const PLAYER_STATUS_TYPES = Object.values(PLAYER_STATUS);

// Auction status constants
const AUCTION_STATUS = {
  UPCOMING: "upcoming",
  LIVE: "live",
  COMPLETED: "completed",
};

const AUCTION_STATUS_TYPES = Object.values(AUCTION_STATUS);

const CONCEALED_BID_REQUEST_STATUS = {
  REQUESTED: "requested",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const CONCEALED_BID_REQUEST_STATUS_TYPES = Object.values(
  CONCEALED_BID_REQUEST_STATUS
);

const SPONSOR_TYPES = {
  TITLE_SPONSOR: "title_sponsor",
  MAJOR_SPONSOR: "major_sponsor",
  OTHER_SPONSOR: "other_sponsor",
};

const SPONSOR_TYPES_VALUES = Object.values(SPONSOR_TYPES);

const TEMPLATE_TYPES = {
  TOURNAMENT_ANNOUNCEMENT: "tournament_announcement",
  TEAM_REGISTRATION: "team_registration",
  TEAM_POSTER: "team_poster",
  PLAYER_REGISTRATION: "player_registration",
  AUCTION_ANNOUNCEMENT: "auction_announcement",
  MATCH_DAY_ANNOUNCEMENT: "match_day_announcement"

};

const TEMPLATE_TYPES_VALUES = Object.values(TEMPLATE_TYPES);

// Other constants
const OTP_LENGTH = 5;
const ALLOWED_UPLOAD_FOLDERS = ["tournaments", "players", "teams", "images", "auction_gallery", "videos", "clipboards", "templates"];
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/svg+xml",
  "image/png",
  "image/bmp",
  "image/webp",
  "text/html",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/mpg",
  "video/webm",
];


const ORGANISER_NOTIFICATION_TYPE = [

  "player_register",
  "team_register",
  "auction_reminder",
  "tournament_reminder"
]
module.exports = {
  OTP_LENGTH,
  SPORT_TYPES,
  SPORTS,
  ROLES,
  USER_TYPES,

  CRICKET_MATCH_TYPES,
  FOOTBALL_MATCH_TYPES,
  CRICKET_BALL_TYPES,
  FOOTBALL_BALL_TYPES,

  SPORTS_NAMES,

  ALLOWED_UPLOAD_FOLDERS,
  ALLOWED_IMAGE_TYPES,

  PLAYER_STATUS,
  PLAYER_STATUS_TYPES,

  TEAM_STATUS,
  TEAM_STATUS_TYPES,

  AUCTION_STATUS,
  AUCTION_STATUS_TYPES,

  CRICKET_PLAYER_CATEGORIES,
  FOOTBALL_PLAYER_CATEGORIES,

  CONCEALED_BID_REQUEST_STATUS,
  CONCEALED_BID_REQUEST_STATUS_TYPES,

  SPONSOR_TYPES,
  SPONSOR_TYPES_VALUES,

  ALLOWED_VIDEO_TYPES,

  TEMPLATE_TYPES,
  ORGANISER_NOTIFICATION_TYPE
};
