const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const TournamentTeams = require("../models/TournamentTeams");
const { ValidationError, NotFoundError } = require("../utils/errors");
const authService = require("./authService");
const { TEAM_MANAGER_ROLE, TEAM_STATUS, ROLES } = require("../utils/constants");
const { parsePhoneNumber } = require("libphonenumber-js");
const { Types } = require("mongoose");
const { sendEmail } = require("./emailService");
const notificationService = require("./notificationService");

class TeamService {

  async createTeam(teamData, tournamentId, status = TEAM_STATUS.APPROVED) {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (new Date() > tournament.endDate) {
      throw new ValidationError("Tournament registration is closed");
    }

    const isAlreadyRegistered = await TournamentTeams.findOne({ tournament: tournamentId, teamManager: teamData.manager });
    if (isAlreadyRegistered) {
      throw new ValidationError("You have already registered a team for this tournament");
    }

    // const managerTeam = await Team.find({ manager: teamData.manager });
    // console.log("managerteam data", managerTeam)

    // if (managerTeam) {
    //   for (let elm of managerTeam) {
    //     const exitingManager = await TournamentTeams.findOne({ tournament: tournamentId, team: elm?._id })
    //     if (exitingManager) {
    //       throw new ValidationError("You have already registered a team for this tournament");
    //     }
    //   }
    // }

    const maxTeamAllowed = tournament?.settings?.maxTeamAllowed;
    const totalTeams = await TournamentTeams.find({ tournament: tournamentId, status: TEAM_STATUS.APPROVED })

    if (totalTeams.length === maxTeamAllowed) {
      throw new ValidationError("Maximum allowed teams reached");
    }

    if (!tournament.settings.auctionEnabled && teamData.squad === null) {
      throw new ValidationError("Squad is required for this tournament");
    }

    if (tournament.settings.auctionEnabled && teamData.squad !== null) {
      throw new ValidationError("Squad is not allowed for this auction tournament");
    }

    // let team = await Team.findOne({ manager: teamData.manager });
    // if (!team) {
    //   team = new Team({
    //     ...teamData,
    //   });
    //   await team.save();
    // }

    let team = new Team({ ...teamData })
    await team.save();

    const teamId = await this.generateTeamId(tournament);

    // Create tournament team entry
    await TournamentTeams.create({
      tournament: tournament._id,
      teamId: teamId,
      team: team._id,
      status: status,
      remainingPoints: tournament.biddingPointPerTeam,
      name: teamData.name,
      phoneNumber: teamData.phoneNumber,
      email: teamData.email,
      teamManager: teamData.manager,
      squad: teamData.squad
    });

    await notificationService.sendNotificationToOrganizer({
      tournamentId: tournament._id,
      type: "team_register"
    });


    // await sendEmail(teamData.email, "Team Registration Confirmation", `You have successfully registered your team: ${teamData.name}. Your Team ID is ${teamId}.`);

    return team;
  }

  async getTeamsByTournamentId(tournamentId, status, search, page = 1, limit = 10) {
    console.log("search", search)
    let query = { tournament: tournamentId };
    if (status) {
      query.status = status;
    }

    // if (search) {
    //   query.teamId = { $regex: search, $options: 'i' };
    // }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
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
        .populate({
          path: 'players',
          populate: {
            path: 'player',
            populate: {
              path: 'player',

            }
          }
        }
        )


        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TournamentTeams.countDocuments(query)
    ]);

    return {
      teams: teams,
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
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
    // const phoneNumber = parsePhoneNumber(teamData.phoneNumber, "IN");

    // if (!phoneNumber.isValid()) {
    //   throw new ValidationError("Invalid phone number");
    // }

    // let user = await authService.getUserByPhoneNumberAndRole(
    //   phoneNumber.nationalNumber,
    //   phoneNumber.countryCallingCode,
    //   ROLES.TEAM_MANAGER
    // );

    // if (!user) {
    //   user = await this.createTeamManager({
    //     name: teamData.managerName,
    //     phoneNumber: phoneNumber.nationalNumber,
    //     countryCode: phoneNumber.countryCallingCode,
    //     email: teamData.email,
    //   });
    // }

    return await this.createTeam(teamData, teamData.tournamentId, TEAM_STATUS.PENDING);
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
