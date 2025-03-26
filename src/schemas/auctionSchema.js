const { z } = require("zod");

const placeBidSchema = z.object({
  playerId: z.string().nonempty({ message: "Player ID is required" }),
  teamId: z.string().nonempty({ message: "Team ID is required" }),
  amount: z.number().min(1, { message: "Amount must be greater than 0" }),
});

module.exports = {
  placeBidSchema,
};
