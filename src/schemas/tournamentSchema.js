const { z } = require("zod");

const SPORT_TYPES = ["cricket", "football"];

const createTournamentSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  location: z.string().nonempty({ message: "Location is required" }),
  logoUrl: z.string().nonempty({ message: "Logo is required" }),
  bannerUrl: z.string().nonempty({ message: "Banner is required" }),
  sportType: z.enum(SPORT_TYPES, { message: "Sport type is invalid" }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  ground: z.string().optional(),
  playersPerTeam: z
    .number()
    .int()
    .positive({ message: "Players per team must be a positive integer" }),
  registrationFee: z.number().optional(),
  teamGroundFee: z.number().optional(),
  auction: z
    .object({
      enabled: z.boolean().default(false),
      playerRegistrationFee: z.number().optional(),
      auctionDate: z.date().optional(),
      auctionTime: z.string().optional(),
      auctionLocation: z.string().optional(),
    })
    .optional(),
  registrationLinks: z
    .object({
      player: z.string().optional(),
      team: z.string().optional(),
    })
    .optional(),
});

const updateTournamentSchema = createTournamentSchema.partial();

module.exports = {
  createTournamentSchema,
  updateTournamentSchema,
};
