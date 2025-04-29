const auctionService = require("../services/auctionService");
const ResponseHandler = require("../utils/responseHandler");
const BaseController = require("./baseController");

class AuctionController extends BaseController {

  constructor() {
    super();
    this.getAuction = this.getAuction.bind(this);
    this.getPlayers = this.getPlayers.bind(this);
    this.getTeams = this.getTeams.bind(this);
    this.startAuction = this.startAuction.bind(this);
    this.generateRandomPlayer = this.generateRandomPlayer.bind(this);
    this.endAuction = this.endAuction.bind(this);
    this.placeBid = this.placeBid.bind(this);
    this.markPlayerSold = this.markPlayerSold.bind(this);
    this.markPlayerUnsold = this.markPlayerUnsold.bind(this);
    this.getBidHistory = this.getBidHistory.bind(this);
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
    console.log("auction players")
    const { auctionId } = req.params;
    try {
      const players = await auctionService.getPlayers(auctionId);
      this.handleSuccess(res, players, "Players retrieved");
    } catch (error) {
      this.handleError(res, error);   
    }
  }

  async getTeams(req, res) {
    const { auctionId } = req.params;
    try {
      const teams = await auctionService.getTeams(auctionId);
      this.handleSuccess(res, teams, "Teams retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async startAuction(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.startAuction(auctionId);
      this.handleSuccess(res, auction, "Auction started");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async generateRandomPlayer(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.generateRandomPlayer(auctionId);
      console.log("random player",auction);
      this.handleSuccess(res, auction, "Random player generated");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async endAuction(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.endAuction(auctionId);
      this.handleSuccess(res, auction, "Auction ended");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async placeBid(req, res) {
    const { auctionId } = req.params;
    try {
      const bid = await auctionService.placeBid(auctionId, req.body);
      this.handleSuccess(res, bid, "Bid placed");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async markPlayerSold(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.markPlayerSold(auctionId, req.body);
      this.handleSuccess(res, auction, "Player marked as sold");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async markPlayerUnsold(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.markPlayerUnsold(auctionId, req.body);
      this.handleSuccess(res, auction, "Player marked as unsold");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBidHistory(req, res) {
    const { auctionId } = req.params;
    try {
      const bidHistory = await auctionService.getBidHistory(auctionId);
      this.handleSuccess(res, bidHistory, "Bid history retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = AuctionController;
