const auctionService = require("../services/auctionService");
const ResponseHandler = require("../utils/responseHandler");
const BaseController = require("./baseController");

class AuctionController extends BaseController {

  constructor() {
    super();
    this.getAuction = this.getAuction.bind(this);
    this.getPlayers = this.getPlayers.bind(this);
    this.getTeams = this.getTeams.bind(this);
  }

  async getAuction(req, res) {
    try {
      const auction = await auctionService.getAuction(req.params.id);
      this.handleSuccess(res, auction, "Auction retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPlayers(req, res) {
    const { tournamentId } = req.params;
    try {
      const players = await auctionService.getPlayers(tournamentId);
      this.handleSuccess(res, players, "Players retrieved");
    } catch (error) {
      this.handleError(res, error);   
    }
  }

  async getTeams(req, res) {
    const { tournamentId } = req.params;
    try {
      const teams = await auctionService.getTeams(tournamentId);
      this.handleSuccess(res, teams, "Teams retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async startAuction(req, res) {
    const { tournamentId } = req.params;
    try {
      const auction = await auctionService.startAuction(tournamentId);
      this.handleSuccess(res, auction, "Auction started");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async placeBid(req, res) {
    const { tournamentId, playerId } = req.params;
    const { bidAmount } = req.body;
    try {
      const bid = await auctionService.placeBid(tournamentId, playerId, bidAmount);
      this.handleSuccess(res, bid, "Bid placed");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = AuctionController;
