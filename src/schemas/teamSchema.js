const { z } = require("zod");
const { extendZodWithOpenApi, createSchema } = require('zod-openapi');
const { TEAM_STATUS } = require("../utils/constants");

extendZodWithOpenApi(z);

const createTeamSchema = z.object({
  name: z.string().nonempty("Team name is required"),
  manager: z.string().nonempty("Team manager required"),
  logoUrl: z.string().nonempty("Team photo is required"),
  phoneNumber: z.string().nonempty("Contact number is required"),
  email: z.string().email("Invalid email address").optional(),
  location: z.string().optional(),
}).openapi();

const updateTeamSchema = z.object({
  team: z.object({
  name: z.string().nonempty("Team name is required"),
  location: z.string().optional(),
  logoUrl: z.string().nonempty("Team photo is required"),
  phoneNumber: z.string().nonempty("Contact number is required"),
  email: z.string().email("Invalid email address").optional(),
  status: z.string().optional().refine((status) => {
    return Object.values(TEAM_STATUS).includes(status);
  }, {
    message: "Invalid status"
  }),
})
}).openapi();

const registerTeamSchema = z.object({
  name: z.string().nonempty("Team name is required"),
  logoUrl: z.string().nonempty("Team photo is required"),
  phoneNumber: z.string().nonempty("Contact number is required"),
  email: z.string().email("Invalid email address").optional(),
  location: z.string().optional(),
  squad: z.string().optional(),
}).openapi();

const approveTeamSchema = z.object({
  approve: z.boolean(),
}).openapi();

const refundTeamSchema = z.object({
  refund: z.boolean(),
}).openapi();

module.exports = {
  createTeamSchema,
  approveTeamSchema,
  refundTeamSchema,
  updateTeamSchema,
  registerTeamSchema
};
