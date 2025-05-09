const Tournament = require("../models/Tournament");
const Auction = require("../models/Auction");
const City = require("../models/City");
const {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");
const { ROLES, PLAYER_STATUS, TEAM_STATUS } = require("../utils/constants");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");

class TournamentService {
  async getTournaments(search, organiserId, statusList, sportTypes, locations, registrationFeesList, page, limit) {
    const query = {};
    if (search) {
      query.name = { $regex: String(search).trim(), $options: "i" };
    }

    if (organiserId) {
      query.createdBy = organiserId;
    }

    if (statusList) {
      const statusListArray = statusList.split(",");
      if (statusListArray.includes("upcoming")) {
        query.startDate = { $gt: new Date() };
      } else if (statusListArray.includes("ongoing")) {
        query.startDate = { $lte: new Date() };
        query.endDate = { $gte: new Date() };
      } else if (statusListArray.includes("expired")) {
        query.endDate = { $lt: new Date() };
      }
    }

    if (sportTypes) {
      query.sportType = { $in: sportTypes.split(",") };
    }

    if (locations) {
      const locationListArray = locations.split(",");
      query.location = { $in: locationListArray };
    }

    // if (registrationFeesList) {
    //   const registrationFeesListArray = registrationFeesList.split(",");
    //   if (registrationFeesListArray.includes("free")) {
    //     query.settings.registrationFees = { $lte: 0 };
    //   } else if (registrationFeesListArray.includes("only_for_team")) {
    //     query.registrationFees = { $gt: 0 };
    //   } else if (registrationFeesListArray.includes("only_for_player")) {
    //     query.registrationFees = { $gt: 0 };
    //   } else if (registrationFeesListArray.includes("all")) {
    //     query.registrationFees = { $gt: 0 };
    //   }
    // }

    const skip = (page - 1) * limit;
    const tournaments = await Tournament.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tournament.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      tournaments,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    };
  }

  async createTournament(tournamentData, user) {
    this.validateTournamentData(tournamentData);

    const city = await City.findOneAndUpdate({ name: tournamentData.location }, { upsert: true, new: true });

    let obj = {
      ...tournamentData,
      organiser: user._id,
      createdBy: user?._id,
      location: city._id,
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
    const tournament = await Tournament.findById(id);
    const auction = await Auction.findOne({ tournament: id });

    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    return { tournament, auction: auction };
  }

  async updateTournamentById(id, updateData, user) {
    const tournament = await this.getTournamentById(id);

    const city = await City.findOneAndUpdate({ name: updateData.location }, { upsert: true, new: true });


    if (!this.canUserModifyTournament(tournament, user)) {
      throw new UnauthorizedError("Not authorized to modify this tournament");
    }

    this.validateUpdateData(updateData);

    const respo = await Tournament.findByIdAndUpdate(
      id,
      { $set: { ...updateData, location: city._id } },
      { new: true, runValidators: true }
    );

    if (respo && updateData?.auction) {
      const auctionRespo = await Auction.findOneAndUpdate(
        { tournament: id },
        { $set: updateData?.auction },
        { new: true, runValidators: true }
      );
    }

    return respo;
  }

  async deleteTournamentById(id, user) {
    const tournament = await this.getTournamentById(id);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }
    if (!this.canUserModifyTournament(tournament, user)) {
      throw new UnauthorizedError("Not authorized to modify this tournament");
    }
    await Tournament.findByIdAndDelete(id);
    return tournament;
  }

  async getOrganiserTournamentsCount(organiserId) {
    const tournaments = await Tournament.find({ createdBy: organiserId });
    return tournaments.length;
  }

  async getOrganiserTournaments(
    organiserId,
    sportType,
    location,
    search,
    page = 1,
    limit = 10
  ) {
    const query = { createdBy: organiserId };

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
    const [tournaments, total] = await Promise.all([
      Tournament.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Tournament.countDocuments(query),
    ]);

    return {
      tournaments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async approvePlayerInTournament(tournamentId, playerId, approve) {
    const plyaerdata = await TournamentPlayers.findOne({
      tournament: tournamentId,
      player: playerId,
    });
    const tournamentPlayer = await TournamentPlayers.findOneAndUpdate(
      {
        tournament: tournamentId,
        player: playerId,
      },
      {
        $set: {
          status: approve ? PLAYER_STATUS.APPROVED : PLAYER_STATUS.REJECTED,
        },
      },
      { new: true }
    );

    console.log("get data", plyaerdata);

    if (!tournamentPlayer) {
      throw new NotFoundError("Tournament or player not found");
    }
    return tournamentPlayer;
  }

  async refundPlayerInTournament(tournamentId, playerId, refund) {
    const tournamentPlayer = await TournamentPlayers.findOneAndUpdate(
      {
        tournament: tournamentId,
        player: playerId,
      },
      {
        $set: {
          status: PLAYER_STATUS.REFUNDED,
        },
      },
      { new: true }
    );

    if (!tournamentPlayer) {
      throw new NotFoundError("Tournament or player not found");
    }
    return tournamentPlayer;
  }

  async approveTeamInTournament(tournamentId, teamId, approve) {
    const tournamentTeam = await TournamentTeams.findOneAndUpdate(
      {
        tournament: tournamentId,
        team: teamId,
      },
      {
        $set: {
          status: approve ? TEAM_STATUS.APPROVED : TEAM_STATUS.REJECTED,
        },
      },
      { new: true }
    );

    if (!tournamentTeam) {
      throw new NotFoundError("Tournament or team not found");
    }
    return tournamentTeam;
  }

  async refundTeamInTournament(tournamentId, teamId, refund) {
    const tournamentTeam = await TournamentTeams.findOneAndUpdate(
      {
        tournament: tournamentId,
        team: teamId,
      },
      {
        $set: {
          status: TEAM_STATUS.REFUNDED,
        },
      },
      { new: true }
    );

    if (!tournamentTeam) {
      throw new NotFoundError("Tournament or team not found");
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
      tournament?.organiser?.toString() === user?._id?.toString() ||
      user?.role === ROLES?.ADMIN
    );
  }

  async validateUpdateData(updateData) {
    if (new Date(updateData.startDate) < new Date()) {
      throw new ValidationError("Start date cannot be in the past");
    }
  }
}

module.exports = new TournamentService();
