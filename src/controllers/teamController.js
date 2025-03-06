const { parsePhoneNumber } = require("libphonenumber-js");
const ResponseHandler = require("../utils/responseHandler");
const teamService = require("../services/teamService");
const BaseController = require('./baseController');

class TeamController extends BaseController {
  async registerTeam(req, res) {
    try {
      const teamData = {
        ...req.body,
        tournamentId: req.params.tournamentId,
      };

      const team = await teamService.registerTeamWithManager(teamData);

      res
        .status(201)
        .json(ResponseHandler.success("Team registered successfully", team));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeamsByTournamentId(req, res) {
    try {
      const { tournamentId } = req.params;
      const teams = await teamService.getTeamsByTournamentId(tournamentId);
      res
        .status(200)
        .json(ResponseHandler.success("Teams retrieved successfully", teams));
    } catch (error) {
      res
        .status(500)
        .json(ResponseHandler.error("Server error", error.message, 500));
    }
  }

  async approveTeam(req, res) {
    const { teamId } = req.params;
    const { approve } = req.body;
    
    const team = await teamService.approveTeam(teamId, approve);
    res.status(200).json(ResponseHandler.success(`${approve ? "Team approved successfully": "Team rejected successfully"}`, team));
  }
} 

module.exports = new TeamController();
