const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const { ValidationError, NotFoundError } = require("../utils/errors");
const authService = require("./authService");
const { TEAM_MANAGER_ROLE, TEAM_STATUS, ROLES } = require("../utils/constants");
const { parsePhoneNumber } = require("libphonenumber-js");
const { Types } = require("mongoose");

class TeamService {
  async registerTeam(teamData, user) {
    const tournament = await Tournament.findById(teamData.tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (new Date() > tournament.endDate) {
      throw new ValidationError("Tournament registration is closed");
    }

    // if (playerData.sport !== tournament.sportType) {
    //   throw new ValidationError(
    //     "Player sport type does not match tournament sport type"
    //   );
    // }

    const team = new Team({
      ...teamData,
      tournament: tournament._id,
      manager: user._id,
      status: TEAM_STATUS.PENDING,
    });

    await team.save();
    return team;
  }

  async getTeamsByTournamentId(tournamentId) {
    const teams = await Team.find({ tournament: new Types.ObjectId(tournamentId) }).sort({
      createdAt: -1,
    });
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

    return await this.registerTeam(teamData, user);
  }

  async approveTeam(teamId, approve) {
    const team = await Team.findById(teamId);
    team.status = approve ? TEAM_STATUS.APPROVED : TEAM_STATUS.REJECTED;
    await team.save();
    return team;
  }
}

module.exports = new TeamService();
