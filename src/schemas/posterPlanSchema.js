const { z } = require("zod");
const { extendZodWithOpenApi } = require("zod-openapi");
const { POSTER_PLAN_INCLUDES, PLANS_TYPES } = require("../utils/constants");

extendZodWithOpenApi(z);

// Dynamically create enum values from keys
const includesEnumValues = Object.keys(POSTER_PLAN_INCLUDES);

const createPosterPlanSchema = z.object({
  name: z.enum([...Object.keys(PLANS_TYPES)]),
  type: z.enum([...Object.values(PLANS_TYPES)]), // Assuming type is one of the keys in POSTER_PLAN_INCLUDES
  description: z.string().optional(),
  price: z.number(),
  // includes: z.array(z.string()).optional(),
  // includesEnum: z.array(z.enum([...includesEnumValues])).optional(),
});

module.exports = {
  createPosterPlanSchema,
};
