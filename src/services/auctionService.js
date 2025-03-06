const Tournament = require("../models/Tournament");

class AuctionService {
  async getAuction(tournamentId) {
    const auction = await Auction.findOne({ tournament: tournamentId });
    return auction;
  }
}

module.exports = new AuctionService();