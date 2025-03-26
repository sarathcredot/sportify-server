const Tournament = require("../models/Tournament");
const Auction = require("../models/Auction");
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { ROLES, PLAYER_STATUS, TEAM_STATUS } = require('../utils/constants');
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");

class TournamentService {

  async getTournaments(sportType, location, search, page = 1, limit = 10) {
    const query = {};

    if (sportType) {
      query.sportType = sportType;
    }

    if (location) {
      query.location = location;
    }

    if (search) {
      query.name = { $regex: String(search).trim(), $options: "i" };
    }

    const skip = (page - 1) * limit;
    const tournaments = await Tournament.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tournament.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      tournaments,
      total,
      totalPages,
    };
  }

  async createTournament(tournamentData, user) {
    this.validateTournamentData(tournamentData);

    let obj = {
      ...tournamentData,
      organiser: user._id,
      createdBy: user?._id,
    };

    const tournament = new Tournament(obj);
    await tournament.save();

    if (tournamentData?.settings?.auctionEnabled) {
      let auction = new Auction({
        ...tournamentData?.auction,
        tournament: tournament?._id,
      });
      auction = await auction.save();
    }
    return tournament;
  }

  async getTournamentById(id) {
    const tournament = await Tournament.findById(id).populate("auction");

    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    return tournament;
  }

  async updateTournament(id, updateData, user) {
    const tournament = await this.getTournamentById(id);

    if (!this.canUserModifyTournament(tournament, user)) {
      throw new UnauthorizedError("Not authorized to modify this tournament");
    }

    this.validateUpdateData(updateData);

    return await Tournament.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async getOrganiserTournaments(user, sportType, location, search) {
    const query = { createdBy: user._id };

    if (sportType) {
      query.sportType = sportType;
    }

    if (location) {
      query.location = location;
    }

    if (search) {
      query.name = { $regex: String(search).trim(), $options: "i" };
    }

    const tournaments = await Tournament.find(query).sort({ createdAt: -1 });
    return tournaments;
  }

  async approvePlayerInTournament(tournamentId, playerId, approve) {
    const tournamentPlayer = await TournamentPlayers.findOneAndUpdate(
      {
        tournament: tournamentId,
        player: playerId
      },
      {
        $set: {
          status: approve ? PLAYER_STATUS.APPROVED : PLAYER_STATUS.REJECTED
        }
      },
      { new: true }
    );

    if (!tournamentPlayer) {
      throw new NotFoundError('Tournament or player not found');
    }
    return tournamentPlayer;
  } 

  async refundPlayerInTournament(tournamentId, playerId, refund) {
    const tournamentPlayer = await TournamentPlayers.findOneAndUpdate(
      {
        tournament: tournamentId,
        player: playerId
      },
      {
        $set: {
          status: PLAYER_STATUS.REFUNDED
        }
      },  
      { new: true }
    );

    if (!tournamentPlayer) {
      throw new NotFoundError('Tournament or player not found');
    }
    return tournamentPlayer;
  }

  async approveTeamInTournament(tournamentId, teamId, approve) {
    const tournamentTeam = await TournamentTeams.findOneAndUpdate(
      {
        tournament: tournamentId,
        team: teamId
      },
      {
        $set: {
          status: approve ? TEAM_STATUS.APPROVED : TEAM_STATUS.REJECTED
        }
      },
      { new: true }
    );

    if (!tournamentTeam) {
      throw new NotFoundError('Tournament or team not found');
    }
    return tournamentTeam;
  }

  async refundTeamInTournament(tournamentId, teamId, refund) {
    const tournamentTeam = await TournamentTeams.findOneAndUpdate(
      {
        tournament: tournamentId,
        team: teamId
      },
      {
        $set: {
          status: TEAM_STATUS.REFUNDED
        }
      },
      { new: true }
    );

    if (!tournamentTeam) {
      throw new NotFoundError('Tournament or team not found');
    }
    return tournamentTeam;
  }
  
  validateTournamentData(data) {
    if (new Date(data.startDate) < new Date()) {
      throw new ValidationError("Start date cannot be in the past");
    }
  }

  canUserModifyTournament(tournament, user) {
    return (
      tournament.organiser.toString() === user._id.toString() ||
      user.role === ROLES.ADMIN
    );
  }

  async validateUpdateData(updateData) {
    // Implementation of validateUpdateData method
  }
}

module.exports = new TournamentService();
