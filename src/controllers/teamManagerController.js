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
}

module.exports = TeamManagerController;
