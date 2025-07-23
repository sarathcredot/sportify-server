const { z } = require("zod");
const { extendZodWithOpenApi } = require("zod-openapi");

extendZodWithOpenApi(z);

const createTeamManagerPlayerSchema = z.object({
  fullName: z.string(),
  position: z.string(),
  photoUrl: z.string(),
  dateOfBirth: z.string(),
  notes: z.string().optional(),
});

const editTeamManagerPlayerSchema = z.object({
  fullName: z.string().optional(),
  position: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
});

module.exports = {
  createTeamManagerPlayerSchema,
  editTeamManagerPlayerSchema
};
