const { z } = require("zod");
const { extendZodWithOpenApi } = require("zod-openapi");

extendZodWithOpenApi(z);

const createAuctionPlanSchema = z.object({
  maxAllowedTeams: z.number(),
  price: z.number(),
  isFree: z.boolean().optional().default(false),
  isUnlimitedTeamsAllowed: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

module.exports = {
  createAuctionPlanSchema,
};
