const { z } = require("zod");
const {
  SPONSOR_TYPES_VALUES,
} = require("../utils/constants");
const { extendZodWithOpenApi, createSchema } = require('zod-openapi');

extendZodWithOpenApi(z);

const createSponsorSchema = createSchema(z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().optional(),
  type: z.enum(SPONSOR_TYPES_VALUES),
  logoUrl: z.string().url().optional(),
}));

const updateSponsorSchema = createSponsorSchema.partial();

module.exports = {
  createSponsorSchema,
  updateSponsorSchema
};
