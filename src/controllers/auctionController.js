const auctionService = require("../services/auctionService");
const ResponseHandler = require("../utils/responseHandler");
const BaseController = require("./baseController");

class AuctionController extends BaseController {
  async getAuction(req, res) {
    try {
      const auction = await auctionService.getAuction(req.params.id);
      res
        .status(200)
        .json(ResponseHandler.success("Auction retrieved", auction));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPlayers(req, res) {
    try {
      const players = await auctionService.getPlayers();
      res.status(200).json(ResponseHandler.success("Players retrieved", players));
    } catch (error) {
      this.handleError(res, error);   
    }
  }

  async getTeams(req, res) {
    try {
      const teams = await auctionService.getTeams();
      res.status(200).json(ResponseHandler.success("Teams retrieved", teams));
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new AuctionController();
