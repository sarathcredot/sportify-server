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

    const teamId = await this.generateTeamId(tournament);

    // Create tournament team entry
    await TournamentTeams.create({
      tournament: tournament._id,
      teamId: teamId,
      team: team._id,
      status: TEAM_STATUS.APPROVED,
      remainingPoints: tournament.biddingPointPerTeam,
      name: teamData.name,
      phoneNumber: teamData.phoneNumber,
      email: teamData.email,
    });

    return team;
  }

  async getTeamsByTournamentId(tournamentId, status, search, page = 1, limit = 10) {
    let query = { tournament: tournamentId };
    if (status) {
      query.status = status;
    }

    if (search) {
      query.teamId = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    let [teams, total] = await Promise.all([
      TournamentTeams.find(query)
        .populate({
          path: 'team',
          populate: {
          path: 'manager'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
      TournamentTeams.countDocuments(query)
    ]);

    return {
      teams: teams,
      pagination: {
        total: total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    };
  }

  async getTeamsByTeamManagerId(search, page = 1, limit = 10, teamManagerId) {
    const query = { manager: teamManagerId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const skip = (page - 1) * limit;
    const [teams, total] = await Promise.all([
      Team.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Team.countDocuments(query)
    ]);

    return {
      teams: teams,
      pagination: {
        total: total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    };
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

  async generateTeamId(tournament) {
    let words = tournament.name.split(' ');
    let prefix;
    if (tournament.idPrefix) {
      prefix = tournament.idPrefix;
    } else {
      if (words.length >= 3) {
        prefix = words
          .slice(0, 3)
          .map(word => word[0])
          .join('')
          .toUpperCase();
      } else {
        prefix = words[0].substring(0, 3).toUpperCase();
      }
    }
    let teamId = prefix + 'T' + String(tournament.teamIdCounter).padStart(4, '0');
    tournament.teamIdCounter = (tournament.teamIdCounter || 0) + 1;
    await tournament.save();
    return teamId;
  }

  async getTeamById(id) {
    const team = await TournamentTeams.findById(id).populate('team');
    if (!team) {
      throw new NotFoundError("Team not found");
    }
    return team;
  }

  async updateTeamById(id, teamData) {
    const tournamentTeam = await TournamentTeams.findById(id);
    if (!tournamentTeam) {
      throw new NotFoundError("Team not found");
    }

    const { name, location, logoUrl, phoneNumber, email, status } = teamData;

    // Update tournament team fields
    const updatedTournamentTeam = await TournamentTeams.findByIdAndUpdate(
      id,
      {
        name,
        phoneNumber,
        email,
        status
      },
      { new: true }
    );

    // Update team fields
    await Team.findByIdAndUpdate(
      tournamentTeam.team,
      {
        name,
        location,
        logoUrl,
        phoneNumber,
        email
      },
      { new: true }
    );

    return updatedTournamentTeam;
  }

  async deleteTeamById(id) {
    const tournamentTeam = await TournamentTeams.findById(id);
    if (!tournamentTeam) {
      throw new NotFoundError("Team not found");
    }
    await Promise.all([
      Team.findByIdAndDelete(tournamentTeam.team),
      TournamentTeams.findByIdAndDelete(id)
    ]);
    return tournamentTeam;
  }
}

module.exports = new TeamService();
