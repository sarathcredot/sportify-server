const ResponseHandler = require("../utils/responseHandler");
const BaseController = require('./baseController');
const tournamentService = require("../services/tournamentService");

class OrganiserController extends BaseController {
  async getOrganiserDashboard(req, res) {
    try {
      const user = req.user;
      const tournaments = await tournamentService.getOrganiserTournaments(user);
      
      const dashboardData = {
        totalTournaments: tournaments.length,
        // Add more dashboard metrics as needed
      };

      res.status(200).json(ResponseHandler.success("Dashboard data retrieved successfully", dashboardData));
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new OrganiserController();
