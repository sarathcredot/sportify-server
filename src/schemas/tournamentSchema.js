const { z } = require("zod");
const { SPORT_TYPES, CRICKET_MATCH_TYPES, FOOTBALL_MATCH_TYPES, CRICKET_BALL_TYPES, FOOTBALL_BALL_TYPES } = require('../utils/constants');

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

// Date schema with preprocessing
const dateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());

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
});

const updateTournamentSchema = createTournamentSchema.partial();

module.exports = {
  createTournamentSchema,
  updateTournamentSchema,
};
