const { parsePhoneNumber } = require("libphonenumber-js");
const ResponseHandler = require("../utils/responseHandler");
const teamService = require("../services/teamService");
const BaseController = require('./baseController');
const tournamentService = require("../services/tournamentService");

class TeamController extends BaseController {

  constructor() {
    super();
    this.createTeam = this.createTeam.bind(this);
    this.registerTeam = this.registerTeam.bind(this);
    this.getTeamsByTournamentId = this.getTeamsByTournamentId.bind(this);
    this.approveTeam = this.approveTeam.bind(this);
    this.refundTeam = this.refundTeam.bind(this);
    this.getTeamById = this.getTeamById.bind(this);
    this.updateTeamById = this.updateTeamById.bind(this);
    this.deleteTeamById = this.deleteTeamById.bind(this);
  }

  async createTeam(req, res) {
    console.log("team create", req.body)
    try {
      const { tournamentId } = req.params;
      console.log("tournement is", tournamentId)
      const teamData = {
        ...req.body,
      };
      const team = await teamService.createTeam(teamData, tournamentId);
      this.handleSuccess(res, team, 'Team created successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async registerTeam(req, res) {
    try {
      const teamData = {
        ...req.body,
        tournamentId: req.params.tournamentId,
        manager: req.user.id,
      };

      const team = await teamService.registerTeamWithManager(teamData);

      res
        .status(201)
        .json(ResponseHandler.success("Team registered successfully", team));
    } catch (error) {
      console.log("team create error", error)
      this.handleError(res, error);
    }
  }

  async getTeamsByTournamentId(req, res) {
    console.log("fillter", req.query)
    try {
      const { tournamentId } = req.params;
      const { status, search, page, limit } = req.query;
      const teams = await teamService.getTeamsByTournamentId(tournamentId, status, search, parseInt(page), parseInt(limit));
      this.handleSuccess(res, teams, 'Teams retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async approveTeam(req, res) {
    try {
      const { tournamentId, teamId } = req.params;
      const { approve } = req.body;
      const team = await tournamentService.approveTeamInTournament(tournamentId, teamId, approve);
      if (team?.msg) {

        this.handleSuccess(res, team?.data, team?.msg);

      }
      this.handleSuccess(res, team?.data, `${approve ? "Team approved successfully" : "Team rejected successfully"}`);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async refundTeam(req, res) {
    try {
      const { tournamentId, teamId } = req.params;
      const { refund } = req.body;
      const team = await tournamentService.refundTeamInTournament(tournamentId, teamId, refund);
      this.handleSuccess(res, team, `${refund ? "Team refunded successfully" : "Team not refunded"}`);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeamById(req, res) {
    console.log("team id", req)
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);
      this.handleSuccess(res, team, "Team retrieved successfully");
    } catch (error) {
      console.log("team get by id error", error)
      this.handleError(res, error);
    }
  }

  async updateTeamById(req, res) {
    try {
      const { id } = req.params;
      const { team } = req.body;
      const updatedTeam = await teamService.updateTeamById(id, team);
      this.handleSuccess(res, updatedTeam, "Team updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteTeamById(req, res) {
    try {
      const { id } = req.params;
      const deletedTeam = await teamService.deleteTeamById(id);
      this.handleSuccess(res, deletedTeam, "Team deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }


   

}

module.exports = TeamController;
