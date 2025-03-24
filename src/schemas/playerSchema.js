const { z } = require("zod");
const {
  SPORT_TYPES,
  CRICKET_PLAYER_CATEGORIES,
  FOOTBALL_PLAYER_CATEGORIES,
  SPORTS_NAMES,
} = require("../utils/constants");
const { dateSchema } = require("../utils/schemaUtils");
const { extendZodWithOpenApi, createSchema } = require('zod-openapi');

extendZodWithOpenApi(z);

const getPlayerCategories = (sport) => {
  console.log(sport, "SPORT IN THE GET PLAYER CATEGORIESS")
  switch (sport) {
    case SPORTS_NAMES.CRICKET:
      return Object.values(CRICKET_PLAYER_CATEGORIES);
    case SPORTS_NAMES.FOOTBALL:
      return Object.values(FOOTBALL_PLAYER_CATEGORIES);
    default:
      return [];
  }
};

const createPlayerSchema = z
  .object({
    firstName: z.string().nonempty("First name is required").openapi({
      example: "John",
      description: "First name of the player",
    }),
    lastName: z.string().nonempty("Last name is required").openapi({
      example: "Doe",
      description: "Last name of the player",
    }),
    photoUrl: z.string().nonempty("Player photo is required").openapi({
      example: "https://example.com/photo.jpg",
      description: "Photo URL of the player",
    }),
    dateOfBirth: dateSchema.openapi({
      description: "Date of birth of the player",
      example: "2000-01-01",
    }),
    contactNumber: z.string().nonempty("Contact number is required").openapi({
      description: "Contact number of the player",
      example: "+919876543210",
    }),
    email: z.string().email("Invalid email address").optional().openapi({
      description: "Email address of the player",
      example: "john.doe@example.com",
    }),
    playerCategory: z.string().openapi({
      description: "Category of the player",
      example: CRICKET_PLAYER_CATEGORIES.BATSMAN,
    }),
    cricHeroesId: z.string().optional().openapi({
      description: "CricHeroes ID of the player",
      example: "1234567890",
    }),
  })
  .superRefine(
    (data, ctx) => {
      const validCategories = getPlayerCategories(data.sport);
      return validCategories.includes(data.playerCategory);
    },
    {
      message: "Invalid player category for selected sport",
    }
  ).openapi({
    summary: "Create a new player",
    description: "Create a new player for a tournament",
    security: [{ bearerAuth: [] }],
  });

const approvePlayerSchema = z.object({
  approve: z.boolean(),
});

const refundPlayerSchema = z.object({
  refund: z.boolean(),
});

module.exports = {
  createPlayerSchema,
  approvePlayerSchema,
  refundPlayerSchema,
};
