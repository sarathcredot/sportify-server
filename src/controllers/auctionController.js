const auctionService = require("../services/auctionService");
const ResponseHandler = require("../utils/responseHandler");
const BaseController = require("./baseController");
const galleryService = require("../services/galleryService");

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
    this.requestConcealedBid = this.requestConcealedBid.bind(this);
    this.getRequestConcealedBid = this.getRequestConcealedBid.bind(this);
    this.placeConcealedBid = this.placeConcealedBid.bind(this);
    this.getConcealedBids = this.getConcealedBids.bind(this);
    this.markPlayerSoldForConcealedBid = this.markPlayerSoldForConcealedBid.bind(this);
    this.cancelConcealedBidRequest = this.cancelConcealedBidRequest.bind(this);
    this.getSignedPlayers = this.getSignedPlayers.bind(this);
    this.getGallery = this.getGallery.bind(this);
    this.addGalleryAsset = this.addGalleryAsset.bind(this);
    this.deleteGalleryAsset = this.deleteGalleryAsset.bind(this);
    this.playGallery = this.playGallery.bind(this);
    this.deleteBid = this.deleteBid.bind(this)
    this.getTeamManagerAuctions = this.getTeamManagerAuctions.bind(this);
    this.revertMarkPlayerSold = this.revertMarkPlayerSold.bind(this);
    this.revertMarkPlayerUnsold = this.revertMarkPlayerUnsold.bind(this);
    this.markPlayerUnsoldForConcealedBid = this.markPlayerUnsoldForConcealedBid.bind(this);
  }

  async getAuction(req, res) {
    try {
      const { auctionId } = req.params;
      const auction = await auctionService.getAuction(auctionId);
      this.handleSuccess(res, auction, "Auction retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPlayers(req, res) {
    const { auctionId } = req.params;
    const { page, limit, search } = req.query;
    try {
      const players = await auctionService.getPlayers(auctionId, parseInt(page), parseInt(limit), search);
      this.handleSuccess(res, players, "Players retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeams(req, res) {
    const { auctionId } = req.params;
    try {
      const { page, limit, search } = req.query;
      const teams = await auctionService.getTeams(auctionId, parseInt(page), parseInt(limit), search);
      this.handleSuccess(res, teams, "Teams retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeamsLivePreview(req, res) {

    console.log("live preview teams ")
    const { tournamentId } = req.params;
    try {

      const teams = await auctionService.getTeamsLivePreview(tournamentId);
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
      console.log("auction contrler error", error)
      this.handleError(res, error);
    }
  }

  async generateRandomPlayer(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.generateRandomPlayer(auctionId);
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

  async deleteBid(req, res) {
    const { auctionId, bidId } = req.params;
    try {
      const bid = await auctionService.deleteBid(bidId);
      this.handleSuccess(res, bid, "Bid deleted");
    } catch (error) {
      console.log("err>>>>>>", error)
      this.handleError(res, error);
    }
  }

  async requestConcealedBid(req, res) {
    const { auctionId } = req.params;
    try {
      const bid = await auctionService.requestConcealedBid(auctionId, req.body);
      this.handleSuccess(res, bid, "Concealed bid requested");
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

  async revertMarkPlayerSold(req, res) {
    const { auctionId, playerId } = req.params;
    try {
      const auction = await auctionService.revertMarkPlayerSold(auctionId, playerId);
      this.handleSuccess(res, auction, "Player marked as sold");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async revertMarkPlayerUnsold(req, res) {
    const { auctionId, playerId } = req.params;
    try {
      const auction = await auctionService.revertMarkPlayerUnsold(auctionId, playerId);
      this.handleSuccess(res, auction, "Player marked as unsold");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async markPlayerUnsoldForConcealedBid(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.markPlayerUnsoldForConcealedBid(auctionId, req.body);
      this.handleSuccess(res, auction, "Player marked as unsold for concealed bid");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBidHistory(req, res) {
    const { auctionId } = req.params;
    const { player } = req.query;
    try {
      const bidHistory = await auctionService.getBidHistory(auctionId, player);
      this.handleSuccess(res, bidHistory, "Bid history retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getRequestConcealedBid(req, res) {
    const { auctionId } = req.params;
    try {
      const bid = await auctionService.getRequestConcealedBid(auctionId);
      this.handleSuccess(res, bid, "Concealed bid request retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async placeConcealedBid(req, res) {
    const { auctionId } = req.params;
    const concealedBid = { ...req.body, placedBy: req.user._id };
    try {
      const bid = await auctionService.placeConcealedBid(auctionId, concealedBid);
      this.handleSuccess(res, bid, "Concealed bid placed");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getConcealedBids(req, res) {
    const { auctionId } = req.params;
    try {
      const bids = await auctionService.getConcealedBids(auctionId);
      this.handleSuccess(res, bids, "Concealed bids retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async markPlayerSoldForConcealedBid(req, res) {
    const { auctionId } = req.params;
    const { teamId } = req.body;
    try {
      const auction = await auctionService.markPlayerSoldForConcealedBid(auctionId, teamId);
      this.handleSuccess(res, auction, "Player marked as sold for concealed bid");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async cancelConcealedBidRequest(req, res) {
    const { auctionId } = req.params;
    try {
      const auction = await auctionService.cancelConcealedBidRequest(auctionId);
      this.handleSuccess(res, auction, "Concealed bid request cancelled");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getSignedPlayers(req, res) {
    const { auctionId } = req.params;
    const { teamId } = req.query;
    console.log("teamId", teamId);
    try {
      const players = await auctionService.getSignedPlayers(auctionId, teamId);
      this.handleSuccess(res, players, "Signed players retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getGallery(req, res) {
    const { auctionId } = req.params;
    try {
      const gallery = await galleryService.getGallery(auctionId);
      this.handleSuccess(res, gallery, "Gallery retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async addGalleryAsset(req, res) {
    const { auctionId } = req.params;
    console.log("boday", req.body);
    try {
      const gallery = await galleryService.addGalleryAsset(auctionId, req.body);
      this.handleSuccess(res, gallery, "Gallery asset added");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteGalleryAsset(req, res) {
    const { auctionId, assetId } = req.params;
    console.log("boday", req.params);
    try {
      const gallery = await galleryService.deleteGalleryAsset(auctionId, assetId);
      this.handleSuccess(res, gallery, "Gallery asset deleted");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getGalleryAssetbyId(req, res) {
    const { auctionId, assetId } = req.params;
    console.log("boday", req.params);
    try {
      const gallery = await galleryService.deleteGalleryAsset(auctionId, assetId);
      this.handleSuccess(res, gallery, "Gallery asset deleted");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async playGallery(req, res) {
    const { auctionId } = req.params;
    try {
      const gallery = await galleryService.playGallery(auctionId);
      this.handleSuccess(res, gallery, "Gallery played");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeamManagerAuctions(req, res) {
    const teamManager = req.user;
    try {
      const auctions = await auctionService.getTeamManagerAuctions(teamManager._id);
      this.handleSuccess(res, auctions, "Team manager auctions retrieved");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = AuctionController;
