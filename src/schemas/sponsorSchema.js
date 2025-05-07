const { z } = require("zod");
const {
  SPONSOR_TYPES_VALUES,
} = require("../utils/constants");
const { extendZodWithOpenApi, createSchema } = require('zod-openapi');

extendZodWithOpenApi(z);

const createSponsorSchema = z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().optional(),
  type: z.enum(SPONSOR_TYPES_VALUES),
  logoUrl: z.string().optional(),
}).openapi({
  example: {
    name: "Sponsor Name",
    websiteUrl: "https://example.com",
    type: "primary",

  },
});

const updateSponsorSchema = z.object({
  name: z.string().min(1).optional(),
  websiteUrl: z.string().url().optional(),
  type: z.enum(SPONSOR_TYPES_VALUES).optional(),
  logoUrl: z.string().optional(),
}).openapi({
  example: {
    name: "Sponsor Name",
    websiteUrl: "https://example.com",
    type: "primary",

  },
});

module.exports = {
  createSponsorSchema,
  updateSponsorSchema
};
