const { z } = require("zod");
const { extendZodWithOpenApi, createSchema } = require("zod-openapi");

extendZodWithOpenApi(z);

const createTemplateSchema = 
// createSchema(
  z.object({
    templateType: z.string(),
    templateData: z.string(),
    templateFileUrl: z.string(),
    // fields: z.array(z.string()).optional()
  })
// );

module.exports = {
  createTemplateSchema,
};
