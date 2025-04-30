const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const { AUCTION_STATUS, PLAYER_STATUS, TEAM_STATUS } = require("../utils/constants");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const e = require("cors");

class AuctionService {
  async getAuction(tournamentId) {
    const auction = await Auction.findOne({ tournament: tournamentId });
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
    const query = { auction: auctionId };
    if (player) {
      query.player = player;
    }
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
    const auction = await Auction.findOneAndUpdate({ _id: auctionId }, { status: AUCTION_STATUS.LIVE }, { new: true });
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    // return random player
    const players = await TournamentPlayers.find({ tournament: auction.tournament, status: PLAYER_STATUS.APPROVED }).populate('player');
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    auction.currentBiddingPlayer = randomPlayer;
    await auction.save();
    console.log('Auction started', players);
    return auction;
  }

  async generateRandomPlayer(auctionId) {
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
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    console.log('Random player', randomPlayer);
    auction.currentBiddingPlayer = randomPlayer;
    await auction.save();
    return auction;
  }

  async endAuction(auctionId) {
    const auction = await Auction.findOneAndUpdate({ _id: auctionId }, { status: AUCTION_STATUS.COMPLETED }, { new: true });
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    return auction;
  }

  async placeBid(auctionId, bid) {
    const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
    const tournament = await Tournament.findById(auction.tournament);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    if (auction.status !== AUCTION_STATUS.LIVE) {
      throw new BadRequestError('Auction is not live');
    }
    if (auction.currentBiddingPlayer.id!== bid.playerId) {
      throw new BadRequestError('You are not allowed to bid on this player');
    }
    if (auction.currentBiddingPlayer.currentBid) {
      const currentBid = await Bid.findById(auction.currentBiddingPlayer.currentBid.bid);
      if (currentBid && bid.points <= currentBid.points + auction.bidIncreaseBy) {
        throw new BadRequestError(`Bid points must be ${auction.bidIncreaseBy} points greater than the current bid points`);
      }
    } else if (bid.points < auction.minBidPerPlayer) {
      throw new BadRequestError(`Minimum bid points is ${auction.minBidPerPlayer}`);
    }
    if (bid.points > auction.maxBidPerPlayer) {
      throw new BadRequestError(`Maximum bid points is ${auction.maxBidPerPlayer}`);
    }
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
    });
    await bidObject.save();
    auction.currentBiddingPlayer.currentBid = {
      bid: bidObject._id,
      team: auction.currentBiddingPlayer.team,
    };
    await auction.save();
    return auction;
  }

  async markPlayerSold(auctionId) {
    const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const player = await TournamentPlayers.findOne({ auction: auction._id, player: auction.currentBiddingPlayer.player });
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    player.status = PLAYER_STATUS.SOLD;
    await player.save();
    // update auction current bidding player
    auction.currentBiddingPlayer = null;
    await auction.save();
    // update team remaining budget
    let currentBid = player.currentBid;
    const team = await TournamentTeams.findById(currentBid.team);
    // First time the remaining points will be undefined, so we need to set it to the max bidding point per team
    team.remainingPoints = team.remainingPoints - currentBid.bid.points;
    team.players.push(player._id);
    team.wonBids.push(currentBid.bid._id);
    await team.save();
    return player;
  }

  async markPlayerUnsold(auctionId) {
    const auction = await Auction.findById(auctionId).populate('currentBiddingPlayer');
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const player = await TournamentPlayers.findOne({ auction: auction._id, player: auction.currentBiddingPlayer.player });
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    player.status = PLAYER_STATUS.UNSOLD;
    await player.save();
    // update auction current bidding player
    auction.currentBiddingPlayer = null;
    await auction.save();
    return player;
  }
}

module.exports = new AuctionService();