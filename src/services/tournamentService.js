const Tournament = require("../models/Tournament");
const Auction = require("../models/Auction");
const City = require("../models/City");
const Team = require("../models/Team");
const mongoose = require("mongoose");
const { sendEmail } = require("./emailService");
const { AUCTION_STATUS } = require("../utils/constants");
const { ValidationError, NotFoundError, BadRequestError, UnauthorizedError } = require("../utils/errors");
const { ROLES, PLAYER_STATUS, TEAM_STATUS } = require("../utils/constants");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");
const AuctionPlan = require("../models/AuctionPlan");
const notificationService = require("./notificationService");

class TournamentService {
  async getTournaments({
    search,
    organiserId,
    statusList,
    sportTypes,
    locations,
    registrationFeesList,
    page,
    limit,
    skip = true,
  }) {
    const query = {};
    if (search) {
      query.name = { $regex: String(search).trim(), $options: "i" };
    }

    if (organiserId) {
      query.createdBy = organiserId;
    }

    if (statusList && statusList.length > 0) {
      console.log("status", statusList);
      // const statusListArray = statusList;
      // if (statusListArray.includes("upcoming")) {
      //   query.startDate = { $gt: new Date() };
      // } else if (statusListArray.includes("ongoing")) {
      //   query.startDate = { $lte: new Date() };
      //   query.endDate = { $gte: new Date() };
      // } else if (statusListArray.includes("expired")) {
      //   query.endDate = { $lt: new Date() };
      // }
      const statusListArray = statusList;
      const now = new Date();

      const statusConditions = [];

      if (statusListArray.includes("upcoming")) {
        statusConditions.push({ startDate: { $gt: now } });
      }

      if (statusListArray.includes("ongoing")) {
        statusConditions.push({
          startDate: { $lte: now },
          endDate: { $gte: now },
        });
      }

      if (statusListArray.includes("expired")) {
        statusConditions.push({ endDate: { $lt: now } });
      }

      if (statusConditions.length > 0) {
        query.$or = statusConditions;
      }
    }

    if (sportTypes && sportTypes.length > 0) {
      if (sportTypes.includes("other")) {
        query.sportType = { $nin: ["cricket", "football"] };
      } else {
        query.sportType = { $in: sportTypes };
      }
    }

    if (locations && locations.length > 0) {
      const locationListArray = locations;
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

    let skipCount = 0;

    if (skip) {
      skipCount = (page - 1) * limit;
    }

    const tournaments = await Tournament.find(query)
      .sort({
        createdAt: -1,
      })
      .populate("location")
      .skip(skipCount)
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

    let city = await City.findOne({
      name: tournamentData.location.toLowerCase(),
    });
    if (!city) {
      city = new City({ name: tournamentData.location.toLowerCase() });
      await city.save();
    }

    if (
      tournamentData?.auction?.maxBidPerPlayer <
      tournamentData?.auction?.minBidPerPlayer
    ) {
      throw new ValidationError(
        "Max bid per player cannot be less than min bid per player"
      );
    }

    let obj = {
      ...tournamentData,
      organiser: user._id,
      createdBy: user?._id,
      location: city._id,
    };

    // console.log("obj", obj)
    let tournament = null;

    const createNewTournament = async () => {
      tournament = new Tournament(obj);
      await tournament.save();
    };

    if (tournamentData?.settings?.auctionEnabled) {
      const auctionPlanExist = await AuctionPlan.findById(
        tournamentData?.auction?.auctionPlan
      );

      if (!auctionPlanExist) {
        throw new Error("Auction plan not found !");
      }

      if (
        tournamentData?.settings?.maxTeamAllowed >
        auctionPlanExist?.maxAllowedTeams &&
        !auctionPlanExist?.isUnlimitedTeamsAllowed
      ) {
        throw new Error(
          `Auction plan maximum teams allowed is ${auctionPlanExist?.maxAllowedTeams} !`
        );
      }

      await createNewTournament();

      let newAuction = new Auction({
        ...tournamentData?.auction,
        tournament: new mongoose.Types.ObjectId(tournament?._id),
      });
      newAuction = await newAuction.save();
    } else {
      await createNewTournament();
    }

    return tournament;
  }

  async getTournamentById(id) {
    const tournament = await Tournament.findById(id).populate("location");
    const auction = await Auction.findOne({ tournament: id }).populate(
      "auctionPlan"
    );

    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    // Convert Mongoose document to plain object
    const tournamentObj = tournament.toObject();
    const auctionObj = auction ? auction.toObject() : null;

    return { tournament: tournamentObj, auction: auctionObj };
  }

  async getTournamentForTeamManagerById(id, user) {
    const tournament = await Tournament.findById(id).populate("location");
    const auction = await Auction.findOne({ tournament: id });

    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    const isRegistered = await TournamentTeams.find({
      tournament: id,
      teamManager: user._id,
    });

    // Convert Mongoose document to plain object
    const tournamentObj = tournament.toObject();
    const auctionObj = auction ? auction.toObject() : null;

    return {
      tournament: { ...tournamentObj, isRegistered: isRegistered.length > 0 },
      auction: auctionObj,
    };
  }

  async getTournamentByIdPoster(id) {
    console.log("get tournament by id poster", id);
    const tournament = await Tournament.findById(id).populate("location");
    const auction = await Auction.findOne({ tournament: id });

    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    console.log(tournament);

    return { tournament, auction: auction };
  }

  async updateTournamentById(id, updateData, user) {
    const tournament = await this.getTournamentById(id);

    if (
      tournament?.auction?.status === AUCTION_STATUS.LIVE ||
      tournament?.auction?.status === AUCTION_STATUS.COMPLETED
    ) {
      throw new BadRequestError(`Tournament editing is not allowed when the auction has already started.`);

    }

    const city = await City.findOneAndUpdate(
      { name: updateData.location?.toLowerCase() },
      { $setOnInsert: { name: updateData?.location?.toLowerCase() } },
      { upsert: true, new: true }
    );

    if (!this.canUserModifyTournament(tournament, user)) {
      throw new UnauthorizedError("Not authorized to modify this tournament");
    }

    this.validateUpdateData(updateData);

    const updateTournament = async () => {
      return await Tournament.findByIdAndUpdate(
        id,
        { $set: { ...updateData, location: city?._id } },
        { new: true, runValidators: true }
      );
    };

    let respo = null;

    if (updateData?.settings?.auctionEnabled) {
      const auctionPlanExist = await AuctionPlan.findById(
        updateData?.auction?.auctionPlan
      );

      if (!auctionPlanExist&& !user?.role === ROLES?.ADMIN) {
        throw new Error("Auction plan not found !");
      }

      if (
        updateData?.settings?.maxTeamAllowed >
        auctionPlanExist?.maxAllowedTeams &&
        !auctionPlanExist?.isUnlimitedTeamsAllowed
      ) {
        throw new Error(
          `Auction plan maximum teams allowed is ${auctionPlanExist?.maxAllowedTeams} !`
        );
      }

      respo = await updateTournament();

      if (respo && updateData?.auction) {
        const auctionExist = await Auction.findOne({
          tournament: new mongoose.Types.ObjectId(id),
        });

        if (auctionExist) {
          await Auction.findOneAndUpdate(
            { tournament: id },
            { $set: updateData?.auction },
            { new: true, runValidators: true }
          );
        } else {
          let newAuction = new Auction({
            ...updateData?.auction,
            tournament: new mongoose.Types.ObjectId(id),
          });
          newAuction = await newAuction.save();
        }
      }
    } else {
      await Auction.findOneAndDelete({ tournament: id });
      respo = await updateTournament();
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
      Tournament.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("location"),
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

  async getTeamManagerTournaments(teamManagerId, search, page = 1, limit = 10) {
    const team = await Team.findOne({ manager: teamManagerId });

    if (!team) {
      console.log("No team found for manager");
      return {
        tournaments: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      };
    }

    const tournamentTeams = await TournamentTeams.find({ team: team._id });
    if (!tournamentTeams || tournamentTeams.length === 0) {
      return {
        tournaments: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      };
    }

    const tournamentIds = tournamentTeams.map(
      (tournamentTeam) => new mongoose.Types.ObjectId(tournamentTeam.tournament)
    );

    const query = { _id: { $in: tournamentIds } };
    if (search) {
      query.name = { $regex: String(search).trim(), $options: "i" };
    }

    const skip = (page - 1) * limit;
    const [tournaments, total] = await Promise.all([
      Tournament.find(query)
        .sort({ createdAt: -1 })
        .populate("location")
        .skip(skip)
        .limit(limit),
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
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (approve) {
      const maxPlayersAllowed = tournament?.settings?.maxPlayersAllowed;
      const tournamentPlayers = await TournamentPlayers.find({
        tournament: tournament?._id,
        status: PLAYER_STATUS.APPROVED,
      });
      if (tournamentPlayers && tournamentPlayers.length === maxPlayersAllowed) {
        throw new NotFoundError("Maximum allowed players reached");
      }
    }

    const plyaerdata = await TournamentPlayers.findOne({
      tournament: tournamentId,
      player: playerId,
    });

    if (plyaerdata?.status === PLAYER_STATUS.REJECTED && approve === false) {
      const tournamentPlayer = await TournamentPlayers.findOneAndUpdate(
        {
          tournament: tournamentId,
          player: playerId,
        },
        {
          $set: {
            status: PLAYER_STATUS.PENDING,
          },
        },
        { new: true }
      );

      await sendEmail(
        plyaerdata?.email,
        "Player Registration Status",
        `Your registration for the tournament ${tournament?.name} has been inprogress}`
      );
      return {
        data: tournamentPlayer,
        msg: "Player status changed successfully",
      };
    }

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

    await sendEmail(plyaerdata?.email, "Player Registration Status Updation",

      {
        title: "Player Registration Status Updation",
        name: plyaerdata?.firstName,
        des: `Your registration for the tournament ${tournament?.name} has been ${approve ? "approved" : "rejected"
          }`,
      }


    );

    return {
      data: tournamentPlayer,
      msg: "",
    };
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
    const tournament = await Tournament.findById(tournamentId);
    //  console.log("tournemt",tournament)
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (approve) {
      console.log(
        "approve team in tournament>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
        tournamentId,
        teamId,
        approve
      );
      const maxTeamsAllowed = tournament?.settings?.maxTeamAllowed;
      const tournamentTeams = await TournamentTeams.find({
        tournament: tournament?._id,
        status: TEAM_STATUS.APPROVED,
      });
      console.log("count", maxTeamsAllowed, tournamentTeams.length);
      if (tournamentTeams && tournamentTeams.length === maxTeamsAllowed) {
        throw new NotFoundError("Maximum allowed teams reached");
      }
    }

    const teamData = await TournamentTeams.findOne({
      tournament: tournamentId,
      team: teamId,
    });

    if (teamData?.status === TEAM_STATUS.REJECTED && approve === false) {
      const tournamentTeam = await TournamentTeams.findOneAndUpdate(
        {
          tournament: tournamentId,
          team: teamId,
        },
        {
          $set: {
            status: TEAM_STATUS.PENDING,
          },
        },
        { new: true }
      );

      await sendEmail(
        tournamentTeam?.email,
        "Team Registration Status",
        `Your registration for the tournament ${tournament?.name} has been inprogress}`
      );
      return {
        data: tournamentTeam,
        msg: "Team status changed successfully",
      };
    }

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
    await sendEmail(
      tournamentTeam?.email,
      "Team Registration Status",
      `Your registration for the tournament ${tournament?.name} has been ${approve ? "approved" : "rejected"
      }`
    );

    // Send in-app notification to team manager
    try {
      await notificationService.sendTeamStatusNotification(
        tournamentId,
        teamId,
        tournamentTeam.teamManager,
        approve ? 'approved' : 'rejected',
        tournamentTeam.name
      );
    } catch (notificationError) {
      console.error('Failed to send team status notification:', notificationError);
    }

    return {
      data: tournamentTeam,
      msg: "",
    };
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

    if (new Date(data.endDate) < new Date()) {
      throw new ValidationError("End date cannot be in the past");
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

  async getLatestTournaments() {
    const result = await Tournament.find()
      .populate("location")
      .sort({ createdAt: -1 })
      .limit(6);

    return result;
  }
}

module.exports = new TournamentService();
