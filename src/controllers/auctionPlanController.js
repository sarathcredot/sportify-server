const auctionPlanService = require("../services/auctionPlanService");
const BaseController = require("./baseController");

class AuctionPlanController extends BaseController {
  constructor() {
    super();
    this.createAuctionPlan = this.createAuctionPlan.bind(this);
    this.getAuctionPlans = this.getAuctionPlans.bind(this);
    this.getAuctionPlanById = this.getAuctionPlanById.bind(this);
    this.updateAuctionPlan = this.updateAuctionPlan.bind(this);
    this.deleteAuctionPlan = this.deleteAuctionPlan.bind(this);
  }

  async createAuctionPlan(req, res) {
    try {
      const auctionPlanData = req.body;
      const auctionPlan = await auctionPlanService.createAuctionPlan(
        auctionPlanData
      );
      this.handleSuccess(res, auctionPlan, "Auction plan created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAuctionPlans(req, res) {
    try {
      const { page = 1, limit = 10, skip = "false", isActive, maxAllowedTeams } = req.query;
      skip === "true" ? true : false;
      const auctionPlans = await auctionPlanService.getAuctionPlans(
        page,
        limit,
        skip,
        isActive,
        maxAllowedTeams ? parseInt(maxAllowedTeams): 0
      );
      this.handleSuccess(
        res,
        auctionPlans,
        "Auction plans retrieved successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAuctionPlanById(req, res) {
    try {
      const { auctionPlanId } = req.params;
      const auctionPlan = await auctionPlanService.getAuctionPlanById(
        auctionPlanId
      );
      this.handleSuccess(
        res,
        auctionPlan,
        "Auction plan retrieved successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateAuctionPlan(req, res) {
    try {
      const { auctionPlanId } = req.params;
      const updatedData = req.body;
      const updatedAuctionPlan = await auctionPlanService.updateAuctionPlan(
        auctionPlanId,
        updatedData
      );
      this.handleSuccess(
        res,
        updatedAuctionPlan,
        "Auction plan updated successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteAuctionPlan(req, res) {
    try {
      const { auctionPlanId } = req.params;
      await auctionPlanService.deleteAuctionPlan(auctionPlanId);
      this.handleSuccess(res, null, "Auction plan deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = AuctionPlanController;
