const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const Team = require("../models/Team");
const Auction = require("../models/Auction");

class AuctionService {
  async getAuction(tournamentId) {
    const auction = await Auction.findOne({ tournament: tournamentId });
    return auction;
  }

  async getPlayers(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    const players = tournament.players.filter((player) => player.isApproved);
    return players;
  }

  async getTeams(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    const teams = tournament.teams.filter((team) => team.isApproved);
    return teams;
  }
}

module.exports = new AuctionService();