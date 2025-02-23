const { z } = require("zod");

const createTeamSchema = z.object({
  name: z.string().nonempty("Team name is required"),
  teamManagerName: z.string().nonempty("Team manager name is required"),
  photoUrl: z.string().nonempty("Team photo is required"),
  contactNumber: z.string().nonempty("Contact number is required"),
  email: z.string().email("Invalid email address").optional(),
  location: z.string().optional(),
});

const approveTeamSchema = z.object({
  approve: z.boolean(),
});

module.exports = {
  createTeamSchema,
  approveTeamSchema,
};
