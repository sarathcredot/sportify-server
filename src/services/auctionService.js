const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const ConcealedBidRequest = require("../models/ConcealedBidRequest");
const { AUCTION_STATUS, PLAYER_STATUS, TEAM_STATUS, CONCEALED_BID_REQUEST_STATUS } = require("../utils/constants");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const e = require("cors");
const mongoose = require('mongoose');
const { getIO } = require('../config/socket');


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

  async getPlayers(auctionId) {
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const players = await TournamentPlayers.find({
      tournament: auction.tournament,
      status: PLAYER_STATUS.APPROVED
    })
      .populate('player');
    console.log(players);
    return players;
  }

  async getTeams(auctionId) {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const teams = await TournamentTeams.find({
      tournament: auction.tournament,
      status: TEAM_STATUS.APPROVED
    }).populate('team');
    return teams;
  }

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
      // Set bidding points for each team
      await TournamentTeams.updateMany({ tournament: auction.tournament, status: TEAM_STATUS.APPROVED }, { $set: { remainingPoints: auction.biddingPointPerTeam } }, { session });
      // return random player
      const players = await TournamentPlayers.find({ tournament: auction.tournament, status: PLAYER_STATUS.APPROVED }).populate('player');
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      auction.currentBiddingPlayer = randomPlayer._id;
      await auction.save({ session, new: true });
      await session.commitTransaction();
      const updatedAuction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
      return updatedAuction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async generateRandomPlayer(auctionId) {
    const session = await mongoose.startSession();
    try {
      await session.startTransaction();
      const auction = await Auction.findOne({ _id: auctionId }).populate('currentBiddingPlayer');
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
      const players = await TournamentPlayers.find({ tournament: auction.tournament, status: PLAYER_STATUS.APPROVED }).populate('player');
      if (players.length === 0) {
        throw new BadRequestError('No more players to bid');
      }
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      console.log('Random player', randomPlayer);
      randomPlayer.status = PLAYER_STATUS.BIDDING;
      await randomPlayer.save({ session });
      auction.currentBiddingPlayer = randomPlayer;
      await auction.save({ session });
      await session.commitTransaction();
      const updatedAuction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
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
      const tournament = await Tournament.findById(auction.tournament).session(session);

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
        if (currentBid && bid.points <= currentBid.points + auction.bidIncreaseBy) {
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
      
      if (pointsAfterBid < minBidPoints) {
        throw new BadRequestError(`Team remaining points are less than the minimum bid points. Minimum bid points is ${minBidPoints}`);
      }
      if (pointsAfterBid < 0) {
        throw new BadRequestError(`Team remaining points are less than the bid points. Team remaining points is ${team.remainingPoints}`);
      }
      const bidObject = new Bid({
        tournament: auction.tournament,
        auction: auction._id,
        player: bid.playerId,
        placedBy: bid.placedBy,
        points: bid.points,
      });
      await bidObject.save({ session });

      const player = await TournamentPlayers.findById(bid.playerId);
      player.currentBid = {
        bid: bidObject._id,
        team: bid.placedBy,
      };
      await player.save({ session });
      await session.commitTransaction();
      return bid;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
    
    // send socket.io notification to the team-manager
    const teams = await TournamentTeams.find({ tournament: auction.tournament, status: TEAM_STATUS.APPROVED }).populate('team');

    const io = getIO();
    io.to(`auction-${auction._id}`).emit('concealed-bid-requested', {
      message: `Concealed bid requested for ${auction.currentBiddingPlayer.player.name}`,
      auctionId: auction._id,
      playerId: auction.currentBiddingPlayer._id,
    });
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
    const team = await TournamentTeams.findById(bid.placedBy);
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
    const bidObject = new Bid({
      tournament: auction.tournament,
      auction: auction._id,
      player: bid.playerId,
      placedBy: bid.placedBy,
      points: bid.points,
      isConcealedBid: true,
      bidRequest: auction.concealedBidRequest._id,
    });
    await bidObject.save();
    auction.currentBiddingPlayer.currentBid = {
      bid: bidObject._id,
      team: bid.placedBy,
    };
    await auction.currentBiddingPlayer.save();
    return bidObject;
  }

  async getConcealedBids(auctionId) {
    const auction = await Auction.findById(auctionId).populate('concealedBidRequest');
    if (!auction) {
      throw new NotFoundError('Auction not found');
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
        throw new BadRequestError('No player to mark sold');
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
      await team.save({ session });
      await session.commitTransaction();
      const updatedPlayer = await TournamentPlayers.findById(player._id);
      return updatedPlayer;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async markPlayerSoldForConcealedBid(auctionId, teamId) {
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
      await player.save({ session });
      auction.currentBiddingPlayer = null;
      auction.concealedBidRequest = null;
      await auction.save({ session });
      await session.commitTransaction();
      const team = await TournamentTeams.findById(teamId).session(session);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      const concealedBid = await Bid.findOne({ bidRequest: auction.concealedBidRequest._id, placedBy: teamId });
      if (!concealedBid) {
        throw new NotFoundError('Concealed bid not found');
      }
      team.remainingPoints = team.remainingPoints - concealedBid.points;
      team.players.push({
        player: player._id,
        signedForPoints: concealedBid.points
      });
      team.wonBids.push(concealedBid._id);
      await team.save({ session });
      await ConcealedBidRequest.findByIdAndUpdate({ auction: auction._id, player: player._id }, { status: CONCEALED_BID_REQUEST_STATUS.COMPLETED }, { session });
      const updatedPlayer = await TournamentPlayers.findById(player._id);
      return updatedPlayer;
    })
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
  }

  async markPlayerUnsold(auctionId) {
    const session = await mongoose.startSession();
    try {
      await session.startTransaction();
      const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
      if (!auction) {
        throw new NotFoundError('Auction not found');
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
      await session.commitTransaction();
      const updatedPlayer = await TournamentPlayers.findById(player._id);
      return updatedPlayer;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
module.exports = new AuctionService();