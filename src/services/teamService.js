const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const TournamentTeams = require("../models/TournamentTeams");
const { ValidationError, NotFoundError } = require("../utils/errors");
const authService = require("./authService");
const { TEAM_MANAGER_ROLE, TEAM_STATUS, ROLES } = require("../utils/constants");
const { parsePhoneNumber } = require("libphonenumber-js");
const { Types } = require("mongoose");

class TeamService {

  async createTeam(teamData, tournamentId) {
    console.log("tournemant cretae func", tournamentId)
    const tournament = await Tournament.findById(tournamentId);
    //  console.log("tournemt",tournament)
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

    // Create tournament team entry
    await TournamentTeams.create({
      tournament: tournament._id,
      team: team._id,
      status: TEAM_STATUS.APPROVED,
    });

    return team;
  }

  async getTeamsByTournamentId(tournamentId, status, search) {
    let query = { tournament: tournamentId };
    if (status) {
      query.status = status;
    }

    if (search) {
      query.team = query.team || {};
      query.team.name = { $regex: search, $options: 'i' };
    }

    let teams = await TournamentTeams.find(query)
      .populate({
        path: 'team',
        populate: {
          path: 'manager'
        }
      })
      .sort({ createdAt: -1 });

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
