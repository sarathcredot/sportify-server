const { z } = require("zod");
const { extendZodWithOpenApi, createSchema } = require("zod-openapi");

extendZodWithOpenApi(z);

const createClipboardSchema = createSchema(
  z
    .object({
      url: z.string().url(),
      for: z.enum(["team", "tournament"]),
      type: z.enum(["logo", "banner"]),
    })
    .openapi({
      example: {
        url: "https://example.com/logo.png",
        for: "team",
        type: "logo",
      },
    })
);

module.exports = {
  createClipboardSchema,
};
