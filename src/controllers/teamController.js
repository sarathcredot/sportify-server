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
  }

  async createTeam(req, res) {
    try {
      const { tournamentId } = req.params;
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
      const { status, search } = req.query;
      const teams = await teamService.getTeamsByTournamentId(tournamentId, status, search);
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
      this.handleSuccess(res, team, `${approve ? "Team approved successfully": "Team rejected successfully"}`);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async refundTeam(req, res) {
    try {
      const { tournamentId, teamId } = req.params;
      const { refund } = req.body;
      const team = await tournamentService.refundTeamInTournament(tournamentId, teamId, refund);
      this.handleSuccess(res, team, `${refund ? "Team refunded successfully": "Team not refunded"}`);
    } catch (error) {
      this.handleError(res, error);
    }
  }
} 

module.exports = TeamController;
