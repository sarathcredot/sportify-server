const BaseController = require("./baseController");
const teamManagerService = require("../services/teamManagerService");

class TeamManagerController extends BaseController {
  constructor() {
    super();
    this.getAllTeamManagers = this.getAllTeamManagers.bind(this);
  }

  async getAllTeamManagers(req, res) {
    try {
      const teamManagers = await teamManagerService.getAllTeamManagers();
      this.handleSuccess(
        res,
        teamManagers,
        "Team managers retrieved successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  getAllTeamManagersPaginated = async (req, res) => {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const teamManagers = await teamManagerService.getAllTeamManagersPaginated(
        search,
        page,
        limit
      );
      this.handleSuccess(
        res,
        teamManagers,
        "Team managers retrieved successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  createTeamManager(req, res) {
    try {
      const teamManager = teamManagerService.createTeamManager(req.body);
      this.handleSuccess(res, teamManager, "Team manager created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  updateTeamManagerById = (req, res) => {
    try {
      const teamManager = teamManagerService.updateTeamManagerById(
        req.params.id,
        req.body
      );
      this.handleSuccess(res, teamManager, "Team manager updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  getTeamManagerById(req, res) {
    try {
      const teamManager = teamManagerService.getTeamManagerById(req.params.id);
      this.handleSuccess(
        res,
        teamManager,
        "Team manager retrieved successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  deleteTeamManagerById(req, res) {
    try {
      const teamManager = teamManagerService.deleteTeamManagerById(
        req.params.id
      );
      this.handleSuccess(res, teamManager, "Team manager deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = TeamManagerController;
