const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const Team = require("../models/Team");
const ConcealedBidRequest = require("../models/ConcealedBidRequest");
const { AUCTION_STATUS, PLAYER_STATUS, TEAM_STATUS, CONCEALED_BID_REQUEST_STATUS } = require("../utils/constants");
const { NotFoundError, BadRequestError, ValidationError } = require("../utils/errors");
const mongoose = require('mongoose');
const { getIO } = require('../config/socket');
const { info } = require("winston");
const socketService = require("./socketService");
const { logger } = require("../config/logger");


class AuctionService {
  async getAuction(auctionId) {
    const auction = await Auction.findById(auctionId).populate({
      path: 'currentBiddingPlayer',
      populate: {
        path: 'player',
      },
    });
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    return auction;
  }

  async getPlayers(auctionId, page = 1, limit = 10, search) {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const query = {
      tournament: auction.tournament,
      status: { $in: [PLAYER_STATUS.APPROVED, PLAYER_STATUS.BIDDING, PLAYER_STATUS.UNSOLD, PLAYER_STATUS.SOLD] }
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { playerId: { $regex: search, $options: 'i' } }
      ];
    }
    const players = await TournamentPlayers.find(query)
      .populate('player')
      .populate('signedForTeam')
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await TournamentPlayers.countDocuments(query);
    return {
      players,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // working code 


  async getTeams(auctionId, page = 1, limit = 10, search) {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const query = {
      tournament: auction.tournament,
      status: TEAM_STATUS.APPROVED
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { teamId: { $regex: search, $options: 'i' } }
      ];
    }
    const teams = await TournamentTeams.find(query)
      .populate('team')
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await TournamentTeams.countDocuments(query);
    return {
      teams,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTeamsLivePreview(tournamentId) {

    const auction = await Auction.findOne({ tournament: tournamentId })
    console.log("auction id", auction._id)
    console.log("tournament id", tournamentId)
    try {

      const aggregation = [
        {
          $match: {
            tournament: new mongoose.Types.ObjectId(tournamentId),
            auction: auction?._id
          }
        },
        {
          $group: {
            _id: {
              teamId: "$placedBy",
              playerId: "$player"
            }
          }
        },
        {
          $group: {
            _id: "$_id.teamId",
            uniquePlayerCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "tournamentteams",
            localField: "_id",
            foreignField: "_id",
            as: "teamInfo"
          }
        },
        {
          $unwind: "$teamInfo"
        },
        {
          $lookup: {
            from: "teams",
            localField: "teamInfo.team",
            foreignField: "_id",
            as: "fullTeam"
          }
        },
        {
          $unwind: "$fullTeam"
        },
        {
          $project: {
            _id: 0,
            participationCount: "$uniquePlayerCount",
            tournamentTeam: "$teamInfo",  // all tournamentteams fields
            teamDetails: "$fullTeam"      // all teams fields
          }
        }
      ];

      const result = await Bid.aggregate(aggregation);
      console.log("res", result)
      return result;

    } catch (error) {

      throw new Error(error)
    }

  }




  // sumesh updated code 
  // async getTeams(auctionId, page = 1, limit = 10, search) {
  //   const auction = await Auction.findById(auctionId);
  //   if (!auction) {
  //     throw new NotFoundError('Auction not found');
  //   }
  //   const query = {
  //     tournament: auction.tournament,
  //     status: TEAM_STATUS.APPROVED
  //   }
  //   if (search) {
  //     query.$or = [
  //       { name: { $regex: search, $options: 'i' } },
  //       { phoneNumber: { $regex: search, $options: 'i' } },
  //       { email: { $regex: search, $options: 'i' } },
  //       { teamId: { $regex: search, $options: 'i' } }
  //     ];
  //   }
  //   const teams = await TournamentTeams.find(query)
  //     .populate('team')
  //     .populate({
  //       path: 'bids',
  //       match: {
  //         player: { $exists: true },
  //         auction: auction._id,
  //         $group: {
  //           _id: '$player',
  //           count: { $sum: 1 }
  //         }
  //       }
  //     })
  //     .skip((page - 1) * limit)
  //     .limit(limit);
  //   const total = await TournamentTeams.countDocuments(query);
  //   return {
  //     teams,
  //     pagination: {
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit)
  //     }
  //   };
  // }

  async getBidHistory(auctionId, player) {
    const query = { auction: auctionId, player: player, isConcealedBid: false };
    console.log("history player", player)

    const bids = await Bid.find(query)
      .populate({
        path: 'placedBy',
        populate: {
          path: 'team'
        }
      })
      .sort({ points: -1 });
    return bids;
  }

  async startAuction(auctionId) {
    const session = await mongoose.startSession();
    try {
      await session.startTransaction();
      let auction = await Auction.findOneAndUpdate({ _id: auctionId, status: AUCTION_STATUS.UPCOMING }, { status: AUCTION_STATUS.LIVE }, { session });
      if (!auction) {
        throw new NotFoundError('Auction not found');
      }
      // return random player
      const players = await TournamentPlayers.find({ tournament: auction.tournament, status: PLAYER_STATUS.APPROVED }).populate('player');
      if (players.length === 0) {
        throw new BadRequestError('No players to bid');
      }
      const teams = await TournamentTeams.find({ tournament: auction.tournament, status: TEAM_STATUS.APPROVED });
      if (teams.length === 0) {
        throw new ValidationError('No teams to bid');
      }
      // const tournament = await Tournament.findById(auction.tournament);
      // const teamsCount = await TournamentTeams.countDocuments({ tournament: auction.tournament, status: TEAM_STATUS.APPROVED });
      // if (players.length < tournament.settings.maxPlayersPerTeam * teamsCount) {
      //   throw new BadRequestError('Not enough players to start auction');
      // }

      // update max points per bid
      // const tournament = await Tournament.findById(auction.tournament, { session });
      // const totalMinBidPointsRequired = (tournament.settings.maxPlayersPerTeam - 1) * tournament.settings.minBidPoints;
      // const maxPointsPerBid = auction.biddingPointPerTeam - totalMinBidPointsRequired;

      const tournament = await Tournament.findById(auction.tournament).session(session);
      // const totalMinBidPointsRequired = (tournament.settings.maxPlayersPerTeam - 1) * tournament.settings.minBidPoints;
      const totalMinBidPointsRequired = (tournament.settings.maxPlayersPerTeam - 1) * auction.minBidPerPlayer;

      const maxPointsPerBid = auction.biddingPointPerTeam - totalMinBidPointsRequired;
      console.log("totalMinBidPointsRequired", totalMinBidPointsRequired)

      // Set bidding points for each team
      await TournamentTeams.updateMany({ tournament: auction.tournament, status: TEAM_STATUS.APPROVED }, { $set: { remainingPoints: auction.biddingPointPerTeam, maxPointsPerBid: maxPointsPerBid } }, { session });

      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      auction.currentBiddingPlayer = randomPlayer._id;
      await auction.save({ session, new: true });
      await session.commitTransaction();
      const updatedAuction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
      // socket.io setup 

      const io = getIO();
      io.to(`${auction._id}-organizer-live-preview`).emit('auction-started', {
        message: `auction started`,
        auctionId: auction._id,
      });

      return updatedAuction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async checkIfAllApprovedPlayersAreSold(auctionId) {
    const auction = await Auction.findOne({ _id: auctionId }).populate(
      "tournament"
    );
    const remainingPlayersCount = await TournamentPlayers.countDocuments({
      tournament: auction.tournament,
      status: {
        $in: [
          PLAYER_STATUS.APPROVED,
          PLAYER_STATUS.BIDDING,
          PLAYER_STATUS.UNSOLD,
        ],
      },
    });
    return remainingPlayersCount === 0;
  }

  async checkIfAllTeamsAreFilled(auctionId) {
    const auction = await Auction.findOne({ _id: auctionId }).populate('tournament');
    const soldPlayersCount = await TournamentPlayers.countDocuments({ tournament: auction.tournament, status: PLAYER_STATUS.SOLD });
    const maxPlayersPerTeam = auction.tournament.settings.maxPlayersPerTeam;
    const teamsCount = await TournamentTeams.countDocuments({ tournament: auction.tournament, status: TEAM_STATUS.APPROVED });

    if (soldPlayersCount === (maxPlayersPerTeam * teamsCount)) {
      return true;
    }
    return false;
  }

  async generateRandomPlayer(auctionId) {
    const session = await mongoose.startSession();
    try {
      await session.startTransaction();
      const auction = await Auction.findOne({ _id: auctionId }).populate('currentBiddingPlayer').populate('tournament');
      if (!auction) {
        throw new NotFoundError('Auction not found');
      }
      if (auction.status !== AUCTION_STATUS.LIVE) {
        throw new BadRequestError('Auction is not live');
      }
      const currentBiddingPlayer = auction.currentBiddingPlayer;
      if (currentBiddingPlayer && currentBiddingPlayer.status !== PLAYER_STATUS.UNSOLD) {
        throw new BadRequestError('Current bidding player is not sold or unsold yet');
      }
      if (await this.checkIfAllApprovedPlayersAreSold(auctionId)) {
        auction.status = AUCTION_STATUS.COMPLETED;
      } else if (await this.checkIfAllTeamsAreFilled(auctionId)) {
        auction.status = AUCTION_STATUS.COMPLETED;
        await TournamentPlayers.updateMany({ tournament: auction.tournament, status: PLAYER_STATUS.APPROVED }, { $set: { status: PLAYER_STATUS.UNSOLD } }, { session });
      } else {
        let players = await TournamentPlayers.find({ tournament: auction.tournament, status: PLAYER_STATUS.APPROVED }).populate('player');
        if (players.length === 0) {
          players = await TournamentPlayers.find({ tournament: auction.tournament, status: PLAYER_STATUS.UNSOLD }).populate('player');
          if (players.length === 0) {
            throw new BadRequestError('No more players to bid');
          }
        }
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        console.log('Random player', randomPlayer);
        randomPlayer.status = PLAYER_STATUS.BIDDING;
        await randomPlayer.save({ session });
        auction.currentBiddingPlayer = randomPlayer;
      }
      await auction.save({ session });
      await session.commitTransaction();
      const updatedAuction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
      const io = getIO();
      io.to(`${auction._id}-organizer-live-preview`).emit('biding-player-live', {
        message: `new player selected of biding`,
        auctionId: auction._id,

      });
      return updatedAuction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async endAuction(auctionId) {
    const auction = await Auction.findOneAndUpdate({ _id: auctionId }, { status: AUCTION_STATUS.COMPLETED }, { new: true });
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    return auction;
  }

  async placeBid(auctionId, bid) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const auction = await Auction.findById(auctionId)
        .populate('currentBiddingPlayer')
        .session(session);
      const tournament = await Tournament.findById(auction.tournament);

      if (!auction) {
        throw new NotFoundError('Auction not found');
      }
      if (auction.status !== AUCTION_STATUS.LIVE) {
        throw new BadRequestError('Auction is not live');
      }
      if (!auction.currentBiddingPlayer) {
        throw new BadRequestError('Generate a random player for bidding');
      }
      if (auction.currentBiddingPlayer.id !== bid.playerId) {
        throw new BadRequestError('You are not allowed to bid on this player');
      }
      if (auction.currentBiddingPlayer.currentBid && auction.currentBiddingPlayer.currentBid.bid) {
        const currentBid = await Bid.findById(auction.currentBiddingPlayer.currentBid.bid).session(session);
        if (currentBid && bid.points < currentBid.points + auction.bidIncreaseBy) {
          throw new BadRequestError(`Bid points must be ${auction.bidIncreaseBy} points greater than the current bid points ${currentBid.points}`);
        }
      }
      if (bid.points < auction.minBidPerPlayer) {
        throw new BadRequestError(`Minimum bid points is ${auction.minBidPerPlayer}`);
      }
      if (bid.points > auction.maxBidPerPlayer) {
        throw new BadRequestError(`Maximum bid points is ${auction.maxBidPerPlayer}`);
      }

      const team = await TournamentTeams.findById(bid.placedBy).session(session);
      const numberOfPlayersInTeam = team.players ? team.players.length : 0;
      const remainingPlayersRequired = tournament.settings.maxPlayersPerTeam - numberOfPlayersInTeam - 1;
      const minBidPoints = remainingPlayersRequired * tournament.settings.minBidPoints;
      const pointsAfterBid = team.remainingPoints - bid.points;

      if (tournament.settings.maxPlayersPerTeam === numberOfPlayersInTeam) {
        throw new BadRequestError(
          `Team has already filled the maximum number of players allowed in the tournament. Maximum players allowed is ${tournament.settings.maxPlayersPerTeam}`
        );
      }

      if (pointsAfterBid < minBidPoints) {
        throw new BadRequestError(`Team remaining points are less than the minimum bid points. Minimum bid points is ${minBidPoints}`);
      }
      if (pointsAfterBid < 0) {
        throw new BadRequestError(`Team remaining points are less than the bid points. Team remaining points is ${team.remainingPoints}`);
      }
      if (bid.points > (team.maxPointsPerBid ?? team.remainingPoints)) {
        throw new BadRequestError(`Team max points per bid is ${team.maxPointsPerBid}`);
      }
      const bidObject = new Bid({
        tournament: auction.tournament,
        auction: auction._id,
        player: bid.playerId,
        placedBy: bid.placedBy,
        points: bid.points,
      });
      await bidObject.save({ session });

      const player = await TournamentPlayers.findById(bid.playerId).session(session);
      player.currentBid = {
        bid: bidObject._id,
        team: bid.placedBy,
      };
      await player.save({ session });
      await session.commitTransaction();
      return bid
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteBid(bidId) {
    const bid = await Bid.findById(bidId)
    console.log("bid>>>>>>>>>>", bid)
    if (!bid) {
      throw new NotFoundError('Bid not found');
    }
    await bid.deleteOne();
    return "deleted";
  }

  async requestConcealedBid(auctionId) {
    const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    if (auction.status !== AUCTION_STATUS.LIVE) {
      throw new BadRequestError('Auction is not live');
    }
    if (!auction.currentBiddingPlayer) {
      throw new BadRequestError('No player to request concealed bid');
    }
    auction.concealedBidRequest = new ConcealedBidRequest({
      auction: auction._id,
      player: auction.currentBiddingPlayer._id,
      points: auction.currentBiddingPlayer.currentBid.points,
    });
    await auction.save();

    // const io = getIO();
    // io.to(`auction-${auction._id}`).emit('concealed-bid-requested', {
    //   message: `Concealed bid requested for ${auction.currentBiddingPlayer.player.name}`,
    //   auctionId: auction._id,
    //   playerId: auction.currentBiddingPlayer._id,
    // });

    try {
      socketService.sendMessageToAllTeamManagersInTournament(auction.tournament, 'concealed-bid-requested', {
        message: `Concealed bid requested for ${auction.currentBiddingPlayer.firstName} ${auction.currentBiddingPlayer.lastName || ''}`,
        auctionId: auctionId,
        playerId: auction.currentBiddingPlayer._id,
        playerName: `${auction.currentBiddingPlayer.firstName} ${auction.currentBiddingPlayer.lastName || ''}`,
      });
    } catch (error) {
      logger.error("Socket event failed to send message to team managers", {
        error,
        auctionId,
      });
    }

    return auction;
  }

  async placeConcealedBid(auctionId, bid) {
    const auction = await Auction.findById(auctionId).populate(['currentBiddingPlayer', 'concealedBidRequest']);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    if (auction.status !== AUCTION_STATUS.LIVE) {
      throw new BadRequestError('Auction is not live');
    }
    if (!auction.concealedBidRequest) {
      throw new BadRequestError('No concealed bid request');
    }
    if (auction.concealedBidRequest.status === CONCEALED_BID_REQUEST_STATUS.COMPLETED) {
      throw new BadRequestError('Concealed bid request is already completed');
    }
    if (auction.concealedBidRequest.status === CONCEALED_BID_REQUEST_STATUS.CANCELLED) {
      throw new BadRequestError('Concealed bid request is cancelled');
    }
    if (!auction.currentBiddingPlayer) {
      throw new BadRequestError('No player to place concealed bid');
    }
    if (auction.currentBiddingPlayer.id !== bid.playerId) {
      throw new BadRequestError('You are not allowed to place concealed bid on this player');
    }
    if (auction.currentBiddingPlayer.currentBid && auction.currentBiddingPlayer.currentBid.bid) {
      throw new BadRequestError('Player has already placed a bid');
    }
    if (bid.points < auction.minBidPerPlayer) {
      throw new BadRequestError(`Minimum bid points is ${auction.minBidPerPlayer}`);
    }
    if (bid.points > auction.maxBidPerPlayer) {
      throw new BadRequestError(`Maximum bid points is ${auction.maxBidPerPlayer}`);
    }
    const existingBid = await Bid.findOne({ bidRequest: auction.concealedBidRequest._id, placedBy: bid.placedBy });
    if (existingBid) {
      throw new BadRequestError('You have already placed a bid');
    }
    const tournament = await Tournament.findById(auction.tournament);
    const team = await TournamentTeams.findById(bid.placedBy).populate('team');
    const numberOfPlayersInTeam = team.players ? team.players.length : 0;
    const remainingPlayersRequired = tournament.settings.maxPlayersPerTeam - numberOfPlayersInTeam - 1;
    const minBidPoints = remainingPlayersRequired * tournament.settings.minBidPoints;
    const pointsAfterBid = team.remainingPoints - bid.points;
    if (pointsAfterBid < minBidPoints) {
      throw new BadRequestError(`Team remaining points are less than the minimum bid points. Minimum bid points is ${minBidPoints}`);
    }
    if (pointsAfterBid < 0) {
      throw new BadRequestError(`Team remaining points are less than the bid points. Team remaining points is ${team.remainingPoints}`);
    }
    if (bid.points > (team.maxPointsPerBid ?? team.remainingPoints)) {
      throw new BadRequestError(`Team max points per bid is ${team.maxPointsPerBid}`);
    }
    const bidObject = new Bid({
      tournament: auction.tournament,
      auction: auction._id,
      player: bid.playerId,
      placedBy: bid.placedBy,
      points: bid.points,
      isConcealedBid: true,
      bidRequest: auction.concealedBidRequest._id,
    });
    const savedBid = await bidObject.save();
    auction.currentBiddingPlayer.currentBid = {
      bid: bidObject._id,
      team: bid.placedBy,
    };
    await auction.currentBiddingPlayer.save();

    // send socket.io notification to the organizer
    const io = getIO();
    io.to(`${auction._id}-organizer`).emit('concealed-bid-placed', {
      message: `Concealed bid placed for ${auction.currentBiddingPlayer.player.name}`,
      auctionId: auction._id,
      team: team.team,
      points: bid.points,
      time: savedBid.createdAt,
    });

    return savedBid;
  }

  async getConcealedBids(auctionId) {
    const auction = await Auction.findById(auctionId).populate('concealedBidRequest');
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    if (!auction.concealedBidRequest) {
      throw new NotFoundError('Concealed bid request not found');
    }
    const bids = await Bid.find({ bidRequest: auction.concealedBidRequest._id, isConcealedBid: true });
    return bids;
  }

  async markPlayerSold(auctionId) {
    const session = await mongoose.startSession();
    try {
      await session.startTransaction();

      const auction = await Auction.findById(auctionId)
        .populate('currentBiddingPlayer')
      // .session(session);

      if (!auction) {
        throw new NotFoundError('Auction not found');
      }

      if (auction.status !== AUCTION_STATUS.LIVE) {
        throw new BadRequestError('Auction is not live');
      }

      if (!auction.currentBiddingPlayer) {
        throw new BadRequestError('No player to mark sold. You have to revert the player unsold status first');
      }

      const player = await TournamentPlayers.findOne({
        tournament: auction.tournament,
        player: auction.currentBiddingPlayer?.player
      })
        .populate('currentBid.bid')
        .session(session);

      if (!player) {
        throw new NotFoundError('Player not found');
      }

      player.status = PLAYER_STATUS.SOLD;
      player.signedForPoints = player.currentBid.bid.points;
      player.signedForTeam = player.currentBid.team;
      await player.save({ session });

      auction.currentBiddingPlayer = null;
      await auction.save({ session });

      let currentBid = player.currentBid;
      const team = await TournamentTeams.findById(currentBid.team).session(session);
      team.remainingPoints = team.remainingPoints - currentBid.bid.points;
      team.players.push({
        player: player._id,
        signedForPoints: currentBid.bid.points
      });
      team.wonBids.push(currentBid.bid._id);

      // update max points per bid
      const tournament = await Tournament.findById(auction.tournament).session(session);
      const numberOfPlayersInTeam = team.players ? team.players.length : 0;
      const remainingPlayersRequired = tournament.settings.maxPlayersPerTeam - numberOfPlayersInTeam - 1;
      if (remainingPlayersRequired > -1) {
        const totalMinBidPointsRequired = remainingPlayersRequired * auction.minBidPerPlayer;
        team.maxPointsPerBid = team.remainingPoints - totalMinBidPointsRequired;
      }


      await team.save({ session });
      await session.commitTransaction();
      const updatedPlayer = await TournamentPlayers.findById(player._id);

      // socket.io setup of live preview 
      const io = getIO();
      io.to(`${auction._id}-organizer-live-preview`).emit('player-sold-live', {
        message: `player sold`,
        auctionId: auction._id,
        team: team,
        point: currentBid.bid.points
      });

      return updatedPlayer;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async revertMarkPlayerSold(auctionId, playerId) {
    console.log("auctid", auctionId)
    console.log("playid", playerId)

    const session = await mongoose.startSession();
    try {
      await session.startTransaction();

      const auction = await Auction.findById(auctionId).session(session);
      if (!auction) {
        throw new NotFoundError('Auction not found');
      }

      if (auction.status !== AUCTION_STATUS.LIVE) {
        throw new BadRequestError('Auction is not live');
      }

      const player = await TournamentPlayers.findOne({
        _id: playerId,
        tournament: auction.tournament,
        status: PLAYER_STATUS.SOLD
      })
        // .populate('currentBid.bid')
        .session(session);

      if (!player) {
        throw new NotFoundError('Player not found or not sold');
      }

      console.log("player", player)

      // Revert player status and remove sold information
      player.status = PLAYER_STATUS.BIDDING;
      player.signedForPoints = null;
      player.signedForTeam = null;
      await player.save({ session });

      // Set the player back as current bidding player
      auction.currentBiddingPlayer = player._id;
      await auction.save({ session });

      const bid = await Bid.findById(player?.currentBid?.bid).session(session);

      // Revert team changes
      const team = await TournamentTeams.findById(player.currentBid.team).session(session);
      if (!team) {
        throw new NotFoundError('Team not found');
      }

      // Restore team's remaining points
      team.remainingPoints = team.remainingPoints + bid.points;

      // Remove player from team's players array
      // team.players = team.players.filter(p => p.player.toString() !== player._id.toString());
      const filteredPlayers = team.players.filter(p => p.player.toString() !== playerId);
      team.players = [];
      team.players.push(...filteredPlayers.map(p => ({
        player: p.player,
        signedForPoints: p.signedForPoints
      })));

      // Remove bid from team's wonBids
      team.wonBids = team.wonBids.filter(bid => bid.toString() !== player.currentBid.bid.toString());

      // Recalculate max points per bid
      const tournament = await Tournament.findById(auction.tournament).session(session);
      const numberOfPlayersInTeam = team.players ? team.players.length : 0;
      const remainingPlayersRequired = tournament.settings.maxPlayersPerTeam - numberOfPlayersInTeam - 1;
      // const totalMinBidPointsRequired = remainingPlayersRequired * auction.minBidPerPlayer;
      // team.maxPointsPerBid = team.remainingPoints - totalMinBidPointsRequired;

      if (remainingPlayersRequired > -1) {
        const totalMinBidPointsRequired = remainingPlayersRequired * auction.minBidPerPlayer;
        team.maxPointsPerBid = team.remainingPoints - totalMinBidPointsRequired;
      }

      await team.save({ session });
      await session.commitTransaction();


      // Emit socket event for live preview
      const io = getIO();
      io.to(`${auction._id}-organizer-live-preview`).emit('player-sold-reverted', {
        message: `player sold status reverted`,
        auctionId: auction._id,
        player: player
      });

      return "reverted";
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getHighestEarliestConcealedBid(bidRequestId) {
    const bid = await Bid.findOne({
      bidRequest: bidRequestId,
      isConcealedBid: true
    })
      .sort({
        points: -1,
        createdAt: 1
      })
      .populate('placedBy');

    if (!bid) {
      throw new NotFoundError('No concealed bids found for this request');
    }
    return bid;
  }

  async markPlayerSoldForConcealedBid(auctionId) {
    runAsTransaction(async (session) => {
      const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer').session(session);
      if (!auction) {
        throw new NotFoundError('Auction not found');
      }
      const player = await TournamentPlayers.findOne({ tournament: auction.tournament, player: auction.currentBiddingPlayer.player }).session(session);
      if (!player) {
        throw new NotFoundError('Player not found');
      }
      player.status = PLAYER_STATUS.SOLD;
      auction.currentBiddingPlayer = null;
      auction.concealedBidRequest = null;
      await auction.save({ session });
      await session.commitTransaction();
      const highestBid = await this.getHighestEarliestConcealedBid(bidRequestId);
      const team = await TournamentTeams.findById(highestBid.placedBy).session(session);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      player.signedForPoints = highestBid.points;
      player.signedForTeam = highestBid.placedBy;
      await player.save({ session });
      team.remainingPoints = team.remainingPoints - concealedBid.points;
      team.players.push({
        player: player._id,
        signedForPoints: concealedBid.points
      });
      team.wonBids.push(concealedBid._id);
      // update max points per bid
      const tournament = await Tournament.findById(auction.tournament).session(session);
      const numberOfPlayersInTeam = team.players ? team.players.length : 0;
      const remainingPlayersRequired = tournament.settings.maxPlayersPerTeam - numberOfPlayersInTeam - 1;
      if (remainingPlayersRequired > -1) {
        const totalMinBidPointsRequired = remainingPlayersRequired * auction.minBidPerPlayer;
        team.maxPointsPerBid = team.remainingPoints - totalMinBidPointsRequired;
      }
      await team.save({ session });
      await ConcealedBidRequest.findByIdAndUpdate({ auction: auction._id, player: player._id }, { status: CONCEALED_BID_REQUEST_STATUS.COMPLETED }, { session });
      const updatedPlayer = await TournamentPlayers.findById(player._id);

      const io = getIO();
      io.to(`${auction._id}-organizer-live-preview`).emit('player-sold-live', {
        message: `player sold`,
        auctionId: auction._id,

      });

      return updatedPlayer;
    })
  }

  async markPlayerUnsoldForConcealedBid(auctionId) {
    const player = await this.markPlayerUnsold(auctionId);
    const auction = await Auction.findById(auctionId).populate('concealedBidRequest');
    auction.concealedBidRequest = null;
    await auction.save();
    const io = getIO();
    io.to(`${auction._id}-organizer-live-preview`).emit('player-unsold-live', {
      message: `player sold`,
      auctionId: auction._id,
      // point: currentBid.bid.points
    });
    return player;
  }

  async cancelConcealedBidRequest(auctionId) {
    const auction = await Auction.findById(auctionId).populate('concealedBidRequest');
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    if (!auction.concealedBidRequest) {
      throw new NotFoundError('Concealed bid request not found');
    }
    await ConcealedBidRequest.findByIdAndUpdate({ _id: auction.concealedBidRequest._id }, { status: CONCEALED_BID_REQUEST_STATUS.CANCELLED });
    auction.concealedBidRequest = null;
    await auction.save();
    return auction;
  }

  async getSignedPlayers(auctionId, teamId) {
    const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const query = { tournament: auction.tournament, status: PLAYER_STATUS.SOLD };
    if (teamId) {
      query.signedForTeam = teamId;
    }
    const players = await TournamentPlayers.find(query).populate('player');
    return players;
  }

  async markPlayerUnsold(auctionId) {
    const session = await mongoose.startSession();
    try {
      await session.startTransaction();
      const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
      if (!auction) {
        throw new NotFoundError('Auction not found');
      }
      if (!auction.currentBiddingPlayer) {
        throw new BadRequestError('No player to mark unsold. You have to revert the player sold status first');
      }
      const player = await TournamentPlayers.findOne({ tournament: auction.tournament, player: auction.currentBiddingPlayer.player });
      if (!player) {
        throw new NotFoundError('Player not found');
      }
      player.status = PLAYER_STATUS.UNSOLD;
      await player.save({ session });
      // update auction current bidding player
      auction.currentBiddingPlayer = null;
      await auction.save({ session });

      const updatedPlayer = await TournamentPlayers.findById(player._id);
      const io = getIO();
      io.to(`${auction._id}-organizer-live-preview`).emit('player-unsold-live', {
        message: `player sold`,
        auctionId: auction._id,
        // point: currentBid.bid.points
      });
      await session.commitTransaction();
      return updatedPlayer;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async revertMarkPlayerUnsold(auctionId, playerId) {
    const session = await mongoose.startSession();
    try {
      await session.startTransaction();

      const auction = await Auction.findById(auctionId).session(session);
      if (!auction) {
        throw new NotFoundError('Auction not found');
      }

      if (auction.status !== AUCTION_STATUS.LIVE) {
        throw new BadRequestError('Auction is not live');
      }

      const player = await TournamentPlayers.findOne({
        _id: playerId,
        tournament: auction.tournament,
        status: PLAYER_STATUS.UNSOLD
      }).session(session);

      if (!player) {
        throw new NotFoundError('Player not found or not marked as unsold');
      }

      // Revert player status back to BIDDING
      player.status = PLAYER_STATUS.BIDDING;
      await player.save({ session });

      // Set the player back as current bidding player
      auction.currentBiddingPlayer = player._id;
      await auction.save({ session });

      await session.commitTransaction();

      // Emit socket event for live preview
      const io = getIO();
      io.to(`${auction._id}-organizer-live-preview`).emit('player-unsold-reverted', {
        message: `player unsold status reverted`,
        auctionId: auction._id,
        player: player
      });

      return "reverted";
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTeamManagerAuctions(teamManagerId) {
    const auctions = await Auction.aggregate([
      {
        $lookup: {
          from: 'tournaments',
          localField: 'tournament',
          foreignField: '_id',
          as: 'tournament'
        }
      },
      {
        $unwind: '$tournament'
      },
      {
        $lookup: {
          from: 'tournamentteams',
          let: { tournamentId: '$tournament._id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$tournament', '$$tournamentId'] }
              }
            },
            {
              $lookup: {
                from: 'teams',
                localField: 'team',
                foreignField: '_id',
                as: 'team'
              }
            },
            {
              $unwind: '$team'
            },
            {
              $match: {
                'team.manager': new mongoose.Types.ObjectId(teamManagerId)
              }
            }
          ],
          as: 'tournamentTeams'
        }
      },
      {
        $match: {
          'tournamentTeams.0': { $exists: true },
          status: { $ne: AUCTION_STATUS.COMPLETED }
        }
      },
      {
        $project: {
          _id: 1,
          tournament: 1,
          auctionDate: 1,
          auctionTime: 1,
          auctionLocation: 1,
          biddingPointPerTeam: 1,
          minBidPerPlayer: 1,
          maxBidPerPlayer: 1,
          bidIncreaseBy: 1,
          biddingTimerLimit: 1,
          message: 1,
          status: 1,
          auctionStartedAt: 1,
          auctionEndedAt: 1,
          currentBiddingPlayer: 1,
          concealedBidRequest: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    return auctions;
  }

}

module.exports = new AuctionService();