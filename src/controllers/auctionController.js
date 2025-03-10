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
}

module.exports = new AuctionController();
