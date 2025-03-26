const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const { AUCTION_STATUS, PLAYER_STATUS } = require("../utils/constants");

class AuctionService {
  async getAuction(tournamentId) {
    const auction = await Auction.findOne({ tournament: tournamentId });
    return auction;
  }

  async getPlayers(tournamentId) {
    const players = await TournamentPlayers.find({
      tournament: tournamentId,
      status: 'APPROVED'
    }).populate('player');
    return players;
  }

  async getTeams(tournamentId) {
    const teams = await TournamentTeams.find({
      tournament: tournamentId,
      status: 'APPROVED'
    }).populate('team');
    return teams;
  }

  async getBidHistory(auctionId) {
    const bids = await Bid.find({ auction: auctionId }).populate('placedBy').sort({ points: -1 });
    return bids;
  }

  async startAuction(auctionId) {
    const auction = await Auction.findOneAndUpdate({ _id: auctionId }, { status: AUCTION_STATUS.LIVE }, { new: true });
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    // return random player
    const players = await TournamentPlayers.find({ auction: auction._id, status: 'APPROVED' }).populate('player');
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    auction.currentBiddingPlayer = randomPlayer;
    await auction.save();
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
    if (auction.currentBiddingPlayer.player.id !== bid.playerId) {
      throw new BadRequestError('You are not allowed to bid on this player');
    }
    const currentBid = auction.currentBiddingPlayer.currentBid;
    if (bid.points <= currentBid.bid.points) {
      throw new BadRequestError('Bid points must be greater than the current bid points');
    }
    const team = await TournamentTeams.findById(bid.placedBy);
    if (!team) {
      throw new NotFoundError('Team not found');
    }
    let remainingPlayersRequired = tournament.settings.maxPlayersPerTeam - team.players.length - 1;
    let minBidPoints = remainingPlayersRequired * tournament.settings.minBidPoints;
    let pointsAfterBid = team.remainingPoints - bid.points;
    if (pointsAfterBid < minBidPoints) {
      throw new BadRequestError('Team remaining points are less than the minimum bid points');
    }
    const bid = new Bid({
      tournament: auction.tournament,
      auction: auction._id,
      player: bid.playerId,
      placedBy: bid.placedBy,
      points: bid.points,
    });
    await bid.save();
    auction.currentBiddingPlayer.currentBid = {
      bid: bid._id,
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