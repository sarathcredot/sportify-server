const OTP_LENGTH = 6;
const SPORT_TYPES = ["cricket", "football"];
const CRICKET_MATCH_TYPES = ["test_match", "limited_over"];
const FOOTBALL_MATCH_TYPES = ["mud_football", "turf_football"];
const CRICKET_BALL_TYPES = ["tennis", "leather", "other"];
const FOOTBALL_BALL_TYPES = ["match", "futsal", "training"];
const PLAYER_STATUS_TYPES = ["pending", "active"];
const PLAYER_AUCTION_STATUS_TYPES = ["available", "sold", "unsold"];
const ALLOWED_UPLOAD_FOLDERS = ["tournaments", "players", "teams", "images"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/webp", "image/tiff"];
const AUCTION_STATUS_TYPES = ["upcoming", "live", "completed"];
const CRICKET_PLAYER_CATEGORIES = [
  "batsman",
  "bowler",
  "all_rounder",
  "wicket_keeper"
];
const FOOTBALL_PLAYER_CATEGORIES = [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward"
];

module.exports = {
  OTP_LENGTH,
  SPORT_TYPES,
  CRICKET_MATCH_TYPES,
  FOOTBALL_MATCH_TYPES,
  CRICKET_BALL_TYPES,
  FOOTBALL_BALL_TYPES,
  PLAYER_STATUS_TYPES,
  PLAYER_AUCTION_STATUS_TYPES,
  ALLOWED_UPLOAD_FOLDERS,
  ALLOWED_IMAGE_TYPES,
  AUCTION_STATUS_TYPES,
  CRICKET_PLAYER_CATEGORIES,
  FOOTBALL_PLAYER_CATEGORIES,
};
