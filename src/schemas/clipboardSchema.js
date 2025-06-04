const { z } = require("zod");
const { extendZodWithOpenApi, createSchema } = require("zod-openapi");
const { PLANS_TYPES } = require("../utils/constants");

extendZodWithOpenApi(z);

// Define a single clipboard item schema
const clipboardItemSchema = z
  .object({
    url: z.string(),
    category: z.enum(["team", "tournament"]).optional(),
    type: z.enum(["logo", "banner"]),
    availableForPlan: z
      .enum(Object.values(PLANS_TYPES))
      .optional(),
  })
  .openapi({
    example: {
      url: "https://example.com/logo.png",
      category: "team",
      type: "logo",
      availableForPlan: PLANS_TYPES.STARTER,
    },
  });

// Now define the full request body schema
const createClipboardSchema = z.object({
  clipboardData: z.array(clipboardItemSchema),
});

module.exports = {
  createClipboardSchema,
};
