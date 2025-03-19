const { z } = require("zod");
const { SPORT_TYPES, CRICKET_MATCH_TYPES, FOOTBALL_MATCH_TYPES, CRICKET_BALL_TYPES, FOOTBALL_BALL_TYPES, SPORTS_NAMES } = require('../utils/constants');
const { dateSchema } = require("../utils/schemaUtils");
const { extendZodWithOpenApi, createSchema } = require('zod-openapi');

extendZodWithOpenApi(z);

// Validation functions
const validateMatchType = (data, ctx) => {
  if (data.sportType === SPORTS_NAMES.CRICKET && !CRICKET_MATCH_TYPES.includes(data.matchType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid match type for cricket",
      path: ["settings", "matchType"],
    });
  }
  if (data.sportType === SPORTS_NAMES.FOOTBALL && !FOOTBALL_MATCH_TYPES.includes(data.matchType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid match type for football",
      path: ["settings", "matchType"],
    });
  }
};

const validateBallType = (data, ctx) => {
  if (data.sportType === SPORTS_NAMES.CRICKET && !CRICKET_BALL_TYPES.includes(data.ballType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid ball type for cricket",
      path: ["settings", "ballType"],
    });
  }
  if (data.sportType === SPORTS_NAMES.FOOTBALL && !FOOTBALL_BALL_TYPES.includes(data.ballType)) {
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
  name: z.string().nonempty("Name is required").openapi({
    example: "Tournament Name",
  }),
  description: z.string().optional().openapi({
    example: "Tournament Description",
  }),
  logoUrl: z.string().nonempty("Logo URL is required").openapi({
    example: "https://example.com/logo.png",
  }),
  bannerUrl: z.string().nonempty("Banner URL is required").openapi({
    example: "https://example.com/banner.png",
  }),
  startDate: dateSchema.openapi({
    example: "2024-01-01",
  }),
  endDate: dateSchema.openapi({
    example: "2024-01-01",
  }),
  sportType: z.enum(SPORT_TYPES).openapi({
    example: SPORTS_NAMES.CRICKET,
  }),
  location: z.string().nonempty("Location is required").openapi({
    example: "Location",
  }),
  ground: z.string().nonempty("Ground is required").openapi({
    example: "Ground",
  }),
  settings: z.object({
    matchType: z.string().openapi({
      example: CRICKET_MATCH_TYPES.LIMITED_OVER,
    }),
    ballType: z.string().openapi({
      example: CRICKET_BALL_TYPES.TENNIS,
    }),
    overs: z.string().optional().openapi({
      example: "20",
    }),
    auctionEnabled: z.boolean().default(false).openapi({
      example: false,
    }),
    maxTeamAllowed: z.number().int().positive().openapi({
      example: 10,
    }),
    maxPlayersPerTeam: z.number().int().positive().openapi({
      example: 11,
    }),
    teamRegistrationFee: z.number().int().positive().openapi({
      example: 1000,
    }),
    playerRegistrationFee: z.number().int().positive().openapi({
      example: 100,
    }),
    teamRegistrationFeeEnabled: z.boolean().default(false).openapi({
      example: false,
    }),
    playerRegistrationFeeEnabled: z.boolean().default(false).openapi({
      example: false,
    }),
  })
  .openapi()
  .superRefine((data, ctx) => {
    validateMatchType(data, ctx);
    validateBallType(data, ctx);
    validateOvers(data, ctx);
  }),
  organiserDetails: z.object({
    name: z.string().nonempty("Organiser name is required").openapi({
      example: "Organiser Name",
    }),
    phoneNumber: z.string().nonempty("Phone number is required").openapi({
      example: "1234567890",
    }),
    alternatePhoneNumber: z
      .string()
      .nonempty("Alternate phone number is required").openapi({
        example: "1234567890",
      }),
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required").openapi({
        example: "organiser@example.com",
      }),
  }),
  auction: z.object({
    auctionDate: dateSchema.openapi({
      example: "2024-01-01",
    }),
    auctionTime: z.string().openapi({
      example: "10:00",
    }),
    // .refine((time) => {
    //   const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    //   return timeRegex.test(time);
    // }, {
    //   message: "Invalid time format, should be HH:mm",
    //   path: ["auctionTime"],
    // }),
    auctionLocation: z.string().openapi({
      example: "Auction Location",
    }),
    biddingPointPerTeam: z.number().openapi({
      example: 1000,
    }),
    minBidPerPlayer: z.number().openapi({
      example: 100,
    }),
    maxBidPerPlayer: z.number().openapi({
      example: 1000,
    }),
    bidIncreaseBy: z.number().openapi({
      example: 100,
    }),
    biddingTimerLimit: z.number().openapi({
      example: 10,
    }),
  })
  .optional()
  .openapi(),
}).superRefine((data, ctx) => {
  validateAuction(data, ctx);
});

const { schema, components } = createSchema(createTournamentSchema);

module.exports = {
  createTournamentSchema, swaggerSchema: schema, swaggerComponents: components
};
