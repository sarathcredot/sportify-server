const { parsePhoneNumber } = require("libphonenumber-js");
const ResponseHandler = require("../utils/responseHandler");
const teamService = require("../services/teamService");

class TeamController {
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
      console.log(error, 'ERROR IN ADD TEAM ')
      if (error.name === "ValidationError") {
        return res.status(400).json(ResponseHandler.error(error.message));
      }
      res
        .status(500)
        .json(
          ResponseHandler.error("Error registering team", error.message, 500)
        );
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
