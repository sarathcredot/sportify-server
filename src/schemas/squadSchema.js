const { z } = require("zod");
const { extendZodWithOpenApi } = require("zod-openapi");

extendZodWithOpenApi(z);

const createSquadSchema = z.object({
  name: z.string().trim(),
  teamManager: z.string().optional(),
  players: z.array(z.string()).optional(),
});

const editSquadSchema = z.object({
  name: z.string().trim().optional(),
  teamManager: z.string().optional(),
  players: z.array(z.string()).optional(),
});

module.exports = {
  createSquadSchema,
  editSquadSchema
};
