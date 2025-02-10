const { z } = require("zod");
const { SPORT_TYPES, CRICKET_MATCH_TYPES, FOOTBALL_MATCH_TYPES, CRICKET_BALL_TYPES, FOOTBALL_BALL_TYPES } = require('../utils/constants');
const { dateSchema } = require("../utils/schemaUtils");
// Validation functions
const validateMatchType = (data, ctx) => {
  if (data.sportType === "cricket" && !CRICKET_MATCH_TYPES.includes(data.matchType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid match type for cricket",
      path: ["settings", "matchType"],
    });
  }
  if (data.sportType === "football" && !FOOTBALL_MATCH_TYPES.includes(data.matchType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid match type for football",
      path: ["settings", "matchType"],
    });
  }
};

const validateBallType = (data, ctx) => {
  if (data.sportType === "cricket" && !CRICKET_BALL_TYPES.includes(data.ballType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid ball type for cricket",
      path: ["settings", "ballType"],
    });
  }
  if (data.sportType === "football" && !FOOTBALL_BALL_TYPES.includes(data.ballType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid ball type for football",
      path: ["settings", "ballType"],
    });
  }
};

const validateOvers = (data, ctx) => {
  if (data.matchType === "limited_over" && !data.overs) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Overs is required if match type is limited over",
      path: ["settings", "overs"],
    });
  }
};

const validateAuction = (data, ctx) => {
  if (data.auctionEnabled == true && !data.auction) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Auction details required",
      path: ["auction"],
    });
  }
};

const createTournamentSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  logoUrl: z.string().nonempty("Logo URL is required"),
  bannerUrl: z.string().nonempty("Banner URL is required"),
  startDate: dateSchema,
  endDate: dateSchema,
  sportType: z.enum(SPORT_TYPES),
  location: z.string().nonempty("Location is required"),
  ground: z.string().nonempty("Ground is required"),
  settings: z.object({
    matchType: z.string(),
    ballType: z.string(),
    overs: z.string().optional(),
    auctionEnabled: z.boolean().default(false),
    maxTeamAllowed: z.number().int().positive(),
    maxPlayersPerTeam: z.number().int().positive(),
    teamRegistrationFeeEnabled: z.boolean().default(false),
    playerRegistrationFeeEnabled: z.boolean().default(false),
  }).superRefine((data, ctx) => {
    validateMatchType(data, ctx);
    validateBallType(data, ctx);
    validateOvers(data, ctx);
  }),
  organiserDetails: z.object({
    name: z.string().nonempty("Organiser name is required"),
    phoneNumber: z.string().nonempty("Phone number is required"),
    alternatePhoneNumber: z
      .string()
      .nonempty("Alternate phone number is required"),
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
  }),
  auction: z.object({
    auctionDate: dateSchema,
    auctionTime: z.string(),
    // .refine((time) => {
    //   const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    //   return timeRegex.test(time);
    // }, {
    //   message: "Invalid time format, should be HH:mm",
    //   path: ["auctionTime"],
    // }),
    auctionLocation: z.string(),
    biddingPointPerTeam: z.number(),
    minBidPerPlayer: z.number(),
    maxBidPerPlayer: z.number(),
    bidIncreaseBy: z.number(),
    biddingTimerLimit: z.number(),
    message: z.string().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  validateAuction(data, ctx);
});

module.exports = {
  createTournamentSchema,
  // updateTournamentSchema,
};
