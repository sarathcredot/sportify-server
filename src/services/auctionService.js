const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const { AUCTION_STATUS } = require("../utils/constants");

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

  async startAuction(tournamentId) {
    const auction = await Auction.findOneAndUpdate({ tournament: tournamentId }, { status: AUCTION_STATUS.LIVE }, { new: true });
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    // return random player
    const players = await TournamentPlayers.find({ tournament: tournamentId, status: 'APPROVED' }).populate('player');
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    auction.currentBiddingPlayer = randomPlayer;
    await auction.save();
    return auction;
  }

  async placeBid(tournamentId, playerId, bidAmount) {
    const auction = await Auction.findOne({ tournament: tournamentId });
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    if (auction.status !== AUCTION_STATUS.LIVE) {
      throw new BadRequestError('Auction is not live');
    }
    if (auction.currentBiddingPlayer.player.id !== playerId) {
      throw new BadRequestError('You are not allowed to bid on this player');
    }
    const currentBid = auction.currentBiddingPlayer.currentBid;
    if (bidAmount <= currentBid.bid.amount) {
      throw new BadRequestError('Bid amount must be greater than the current bid amount');
    }
    const bid = new Bid({
      tournament: tournamentId,
      auction: auction._id,
      player: playerId,
      placedBy: auction.placedBy,
      amount: bidAmount,
    });
    await bid.save();
    auction.currentBiddingPlayer.currentBid = {
      bid: bid._id,
      team: auction.currentBiddingPlayer.team,
    };
    await auction.save();
    return auction;
  }
}

module.exports = new AuctionService();