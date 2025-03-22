const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const { ValidationError, NotFoundError } = require("../utils/errors");
const authService = require("./authService");
const { TEAM_MANAGER_ROLE, TEAM_STATUS, ROLES } = require("../utils/constants");
const { parsePhoneNumber } = require("libphonenumber-js");
const { Types } = require("mongoose");

class TeamService {

  async createTeam(teamData, tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (new Date() > tournament.endDate) {
      throw new ValidationError("Tournament registration is closed");
    }

    const team = new Team({
      ...teamData,
    });

    await team.save();
    tournament.teams.push({
      team: team._id,
      status: TEAM_STATUS.APPROVED,
    });
    await tournament.save();
    return team;
  }

  async getTeamsByTournamentId(tournamentId) {
    const tournament = await Tournament.findById(tournamentId).populate("teams.team");
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }
    const teams = tournament.teams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return teams;
  }

  async createTeamManager(teamManagerData) {
    return authService.createUser({
      ...teamManagerData,
      role: ROLES.TEAM_MANAGER,
    });
  }

  async registerTeamWithManager(teamData) {
    const phoneNumber = parsePhoneNumber(teamData.phoneNumber, "IN");

    if (!phoneNumber.isValid()) {
      throw new ValidationError("Invalid phone number");
    }

    let user = await authService.getUserByPhoneNumberAndRole(
      phoneNumber.nationalNumber,
      phoneNumber.countryCallingCode,
      ROLES.TEAM_MANAGER
    );

    console.log(user, 'USER')

    if (!user) {
      user = await this.createTeamManager({
        name: teamData.managerName,
        phoneNumber: phoneNumber.nationalNumber,
        countryCode: phoneNumber.countryCallingCode,
        email: teamData.email,
      });
    }

    return await this.registerTeam(teamData, teamData.tournamentId, user);
  }

}

module.exports = new TeamService();
