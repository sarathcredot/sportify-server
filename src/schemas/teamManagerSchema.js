const { z } = require("zod");
const { extendZodWithOpenApi } = require('zod-openapi');

extendZodWithOpenApi(z);

const updateTeamManagerSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).openapi({
  example: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "1234567890",
    isVerified: true,
    isActive: true,
  }
})

module.exports = {
  updateTeamManagerSchema
};
