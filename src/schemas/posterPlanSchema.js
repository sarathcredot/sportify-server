const { z } = require("zod");
const { extendZodWithOpenApi } = require("zod-openapi");
const { POSTER_PLAN_INCLUDES } = require("../utils/constants");

extendZodWithOpenApi(z);

// Dynamically create enum values from keys
const includesEnumValues = Object.keys(POSTER_PLAN_INCLUDES);

const createPosterPlanSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  includes: z.array(z.string()).optional(),
  includesEnum: z.array(z.enum([...includesEnumValues])).optional(),
  isStarterPlanIncluded: z.boolean().optional().default(false),
  isBasicPlanIncluded: z.boolean().optional().default(false),
});

module.exports = {
  createPosterPlanSchema,
};
