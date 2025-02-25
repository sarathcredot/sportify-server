const { z } = require("zod");
const {
  SPORT_TYPES,
  CRICKET_PLAYER_CATEGORIES,
  FOOTBALL_PLAYER_CATEGORIES,
  SPORTS_NAMES,
} = require("../utils/constants");
const { dateSchema } = require("../utils/schemaUtils");

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
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().nonempty("Last name is required"),
    photoUrl: z.string().nonempty("Player photo is required"),
    dateOfBirth: dateSchema,
    contactNumber: z.string().nonempty("Contact number is required"),
    sport: z.enum(SPORT_TYPES, {
      errorMap: () => ({ message: "Invalid sport type" }),
    }),
    playerCategory: z.string(),
    cricHeroesId: z.string().optional(),
    notes: z.string().optional(),
    // tournamentId: z.string().nonempty("Tournament ID is required"),
  })
  .superRefine(
    (data, ctx) => {
      const validCategories = getPlayerCategories(data.sport);
      return validCategories.includes(data.playerCategory);
    },
    {
      message: "Invalid player category for selected sport",
    }
  );

const approvePlayerSchema = z.object({
  approve: z.boolean(),
});

module.exports = {
  createPlayerSchema,
  approvePlayerSchema,
};
