const User = require("../models/User");
const { ROLES } = require("../utils/constants");


class TeamManagerService {
  async getAllTeamManagers() {
    const teamManagers = await User.find({ role: ROLES.TEAM_MANAGER, isVerified: true }).select('fullName');
    return teamManagers;
  }
}

module.exports = new TeamManagerService();
