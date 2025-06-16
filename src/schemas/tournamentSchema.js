const { z } = require("zod");
const { SPORT_TYPES, CRICKET_MATCH_TYPES, FOOTBALL_MATCH_TYPES, CRICKET_BALL_TYPES, FOOTBALL_BALL_TYPES, SPORTS_NAMES } = require('../utils/constants');
const { dateSchema } = require("../utils/schemaUtils");
const { extendZodWithOpenApi } = require('zod-openapi');

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
      example: 50,
    }),
    maxPlayersAllowed: z.number().int().positive().openapi({
      example: 100,
    }),
    maxPlayersPerTeam: z.number().int().positive().openapi({
      example: 10,
    }),
    teamRegistrationFeeEnabled: z.boolean().default(false).openapi({
      example: false,
    }),
    teamRegistrationFee: z.number().int().min(0).openapi({
      example: 1000,
    }),
    playerRegistrationFeeEnabled: z.boolean().default(false).openapi({
      example: false,
    }),
    playerRegistrationFee: z.number().int().min(0).openapi({
      example: 100,
    }),
  })
    .superRefine((data, ctx) => {
      validateMatchType(data, ctx);
      validateBallType(data, ctx);
      validateOvers(data, ctx);

      if (data.teamRegistrationFeeEnabled && data.teamRegistrationFee <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Team registration fee must be a positive integer when enabled",
          path: ["settings", "teamRegistrationFee"],
        });
      }

      if (data.playerRegistrationFeeEnabled && data.playerRegistrationFee <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Player registration fee must be a positive integer when enabled",
          path: ["settings", "playerRegistrationFee"],
        });
      }
    })
    .openapi(),
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
    // auctionDate: dateSchema.openapi({
    //   example: "2024-01-01",
    // }),
    // auctionTime: z.string().openapi({
    //   example: "10:00",
    // }),
    // auctionLocation: z.string().openapi({
    //   example: "Auction Location",
    // }),
    auctionPlan: z.string().optional(),
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
    biddingTimerLimit: z.string().openapi({
      example: "10",
    }),
  })
    .optional()
    .openapi(),
}).superRefine((data, ctx) => {
  // validateAuction(data, ctx);
  console.log("form data", JSON.stringify(data))
  // Ensure auction data is required if auctionEnabled is true
  if (data.settings.auctionEnabled) {
    if (!data.auction) {
      // ctx.addIssue({
      //   code: z.ZodIssueCode.custom,
      //   message: "Auction details are required when auction is enabled",
      //   path: ["auction"],
      // });
    } else {
      // Ensure all required fields are present in the auction object
      const requiredAuctionFields = [
        // "auctionDate",
        // "auctionTime",
        // "auctionLocation",
        "biddingPointPerTeam",
        "minBidPerPlayer",
        "maxBidPerPlayer",
        "bidIncreaseBy",
        "biddingTimerLimit",
      ];

      requiredAuctionFields.forEach((field) => {
        if (!data.auction[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field} is required when auction is enabled`,
            path: ["auction", field],
          });
        }
      });
    }
  }
});










const updateTournamentSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  sportType: z.enum(SPORT_TYPES).optional(),
  location: z.string().optional(),
  ground: z.string().optional(),
  settings: z.object({
    matchType: z.string().optional(),
    ballType: z.string().optional(),
    overs: z.string().optional(),
    auctionEnabled: z.boolean().optional(),
    maxTeamAllowed: z.number().int().positive().optional(),
    maxPlayersAllowed: z.number().int().positive().optional(),
    maxPlayersPerTeam: z.number().int().positive().optional(),
    teamRegistrationFeeEnabled: z.boolean().optional(),
    teamRegistrationFee: z.number().int().min(0).optional(),
    playerRegistrationFeeEnabled: z.boolean().optional(),
    playerRegistrationFee: z.number().int().min(0).optional(),
  }).optional(),
  organiserDetails: z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    alternatePhoneNumber: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  auction: z.object({
    auctionId: z.string().optional(),
    // auctionDate: dateSchema.optional(),
    // auctionTime: z.string().optional(),
    // auctionLocation: z.string().optional(),
    biddingPointPerTeam: z.number().optional(),
    minBidPerPlayer: z.number().optional(),
    maxBidPerPlayer: z.number().optional(),
    bidIncreaseBy: z.number().optional(),
    biddingTimerLimit: z.string().optional(),
    auctionPlan: z.string().optional()
  }).optional(),
}).openapi({
  example: {
    name: "Tournament Name",
    description: "Tournament Description",
  }
});

module.exports = {
  createTournamentSchema,
  updateTournamentSchema
};
