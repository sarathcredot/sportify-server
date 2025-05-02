const BaseController = require("./baseController");
const teamManagerService = require("../services/teamManagerService");
const teamService = require("../services/teamService");
const userService = require("../services/userService");
const { ROLES } = require("../utils/constants");

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
      // const teamManagers = await teamManagerService.getAllTeamManagersPaginated(search, page, limit);
      const teamManagers = await userService.getAllUsersPaginated(search, page, limit, ROLES.TEAM_MANAGER);
      this.handleSuccess(res, teamManagers, "Team managers retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createTeamManager(req, res) {
    try {
      const teamManager = await teamManagerService.createTeamManager(req.body);
      this.handleSuccess(res, teamManager, "Team manager created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

   updateTeamManagerById = async (req, res) =>  {
    try {
      const teamManager = await userService.updateUserById(req.params.id, req.body, ROLES.TEAM_MANAGER);
      this.handleSuccess(res, teamManager, "Team manager updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  getTeamManagerById = async (req, res) =>  {
    try {
      const teamManager = await userService.getUserById(req.params.id, ROLES.TEAM_MANAGER);
      this.handleSuccess(res, teamManager, "Team manager retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeamManagerTeamsById(req, res) {
    try {
      const { search, page, limit } = req.query;
      const teamManager = await teamService.getTeamsByTeamManagerId(search, parseInt(page), parseInt(limit), req.params.id);
      this.handleSuccess(res, teamManager, "Team manager teams retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

   deleteTeamManagerById = async(req, res) => {
    try {
      const teamManager = await teamManagerService.deleteTeamManagerById(req.params.id);
      this.handleSuccess(res, teamManager, "Team manager deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = TeamManagerController;
