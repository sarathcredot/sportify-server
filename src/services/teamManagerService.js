const User = require("../models/User");
const { ROLES } = require("../utils/constants");
const Team = require("../models/Team");


class TeamManagerService {
  async getAllTeamManagers() {
    const teamManagers = await User.find({ role: ROLES.TEAM_MANAGER, isVerified: true }).select('fullName');
    return teamManagers;
  }

  async getAllTeamManagersPaginated(search, page, limit) {
    const query = {
        role: ROLES.TEAM_MANAGER,
        isVerified: true,
    };
    if (search) {
      query.fullName = { $regex: search, $options: 'i' };
      query.email = { $regex: search, $options: 'i' };
      query.phoneNumber = { $regex: search, $options: 'i' };
    }
    const teamManagers = await User.find(query).skip((page - 1) * limit).limit(limit);
    return teamManagers;
  }

  async createTeamManager(teamManager) {
    const newTeamManager = await User.create({ ...teamManager, role: ROLES.TEAM_MANAGER });
    return newTeamManager;
  }

  async updateTeamManagerById(id, teamManager) {
    const updatedTeamManager = await User.findByIdAndUpdate(id, teamManager, { new: true });
    return updatedTeamManager;
  }

  async getTeamManagerById(id) {
    const teamManager = await User.findById(id);
    if (!teamManager) {
      throw new Error("Team manager not found");
    }
    if (teamManager.role !== ROLES.TEAM_MANAGER) {
      throw new Error("Team manager not found");
    }
    const teams = await Team.find({ manager: id });
    return { ...teamManager, teams };
  }

  async deleteTeamManagerById(id) {
    const teamManager = await User.findById(id);
    if (!teamManager) {
      throw new Error("Team manager not found");
    }
    if (teamManager.role !== ROLES.TEAM_MANAGER) {
      throw new Error("Team manager not found");
    }
    await User.findByIdAndDelete(id);
    return { message: "Team manager deleted successfully" };
  }
}

module.exports = new TeamManagerService();