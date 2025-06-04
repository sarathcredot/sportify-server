const { z } = require("zod");
const { extendZodWithOpenApi, createSchema } = require("zod-openapi");
const { PLANS_TYPES } = require("../utils/constants");

extendZodWithOpenApi(z);

const createTemplateSchema = 
// createSchema(
  z.object({
    templateType: z.string(),
    templateData: z.string(),
    templateFileUrl: z.string(),
    availableForPlan: z.enum(Object.values(PLANS_TYPES)).optional(),
    // fields: z.array(z.string()).optional()
  })
// );

module.exports = {
  createTemplateSchema,
};
