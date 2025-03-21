const { z } = require("zod");
const { extendZodWithOpenApi, createSchema } = require('zod-openapi');

extendZodWithOpenApi(z);

const createTeamSchema = z.object({
  name: z.string().nonempty("Team name is required"),
  manager: z.string().nonempty("Team manager id is required"),
  photoUrl: z.string().nonempty("Team photo is required"),
  contactNumber: z.string().nonempty("Contact number is required"),
  email: z.string().email("Invalid email address").optional(),
  location: z.string().optional(),
}).openapi();

const approveTeamSchema = z.object({
  approve: z.boolean(),
}).openapi();

module.exports = {
  createTeamSchema,
  approveTeamSchema,
};
