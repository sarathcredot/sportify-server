const posterPlanService = require("../services/posterPlanService");
const BaseController = require("./baseController");

class PosterPlanController extends BaseController {
  constructor() {
    super();
    this.createPosterPlan = this.createPosterPlan.bind(this);
    this.getPosterPlans = this.getPosterPlans.bind(this);
    this.getPosterPlanById = this.getPosterPlanById.bind(this);
    this.updatePosterPlan = this.updatePosterPlan.bind(this);
    this.deletePosterPlan = this.deletePosterPlan.bind(this);
  }
  async createPosterPlan(req, res) {
    try {
      const posterPlanData = req.body;
      const posterPlan = await posterPlanService.createPosterPlan(
        posterPlanData
      );
      this.handleSuccess(res, posterPlan, "Plan created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async getPosterPlans(req, res) {
    try {
      let { isActive } = req.query;
      const posterPlans = await posterPlanService.getPosterPlans(isActive);
      this.handleSuccess(res, posterPlans, "Plans retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async getPosterPlanById(req, res) {
    try {
      const { posterPlanId } = req.params;
      const posterPlan = await posterPlanService.getPosterPlanById(
        posterPlanId
      );
      this.handleSuccess(res, posterPlan, "Plan retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async updatePosterPlan(req, res) {
    try {
      const { posterPlanId } = req.params;
      const posterPlanData = req.body;
      const updatedPosterPlan = await posterPlanService.updatePosterPlan(
        posterPlanId,
        posterPlanData
      );
      this.handleSuccess(res, updatedPosterPlan, "Plan updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async deletePosterPlan(req, res) {
    try {
      const { posterPlanId } = req.params;
      const deletedPosterPlan = await posterPlanService.deletePosterPlan(
        posterPlanId
      );
      this.handleSuccess(res, deletedPosterPlan, "Plan deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = PosterPlanController;
