const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const TournamentTeams = require("../models/TournamentTeams");
const Auction = require("../models/Auction");

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
}

module.exports = new AuctionService();