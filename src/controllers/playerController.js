const playerService = require('../services/playerService');
const tournamentService = require('../services/tournamentService');
const ResponseHandler = require('../utils/responseHandler');
const { PLAYER_STATUS } = require('../utils/constants');
const BaseController = require('./baseController');

class PlayerController extends BaseController {

  constructor() {
    super();
    this.registerPlayer = this.registerPlayer.bind(this);
    this.createPlayer = this.createPlayer.bind(this);
    this.getPlayersByTournamentId = this.getPlayersByTournamentId.bind(this);
    this.approvePlayer = this.approvePlayer.bind(this);
    this.getPlayersOfTeamManager = this.getPlayersOfTeamManager.bind(this);
    this.createPlayerOfTeamManager = this.createPlayerOfTeamManager.bind(this);
    this.editPlayerOfTeamManager = this.editPlayerOfTeamManager.bind(this);
    this.removePlayerOfTeamManager = this.removePlayerOfTeamManager.bind(this);
    this.refundPlayer = this.refundPlayer.bind(this)
  }

  async registerPlayer(req, res) {
    try {
      const playerData = {
        ...req.body,
        tournamentId: req.params.tournamentId
      };
      const player = await playerService.registerPlayer(playerData);
      this.handleSuccess(res, player, 'Player registered successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createPlayer(req, res) {
    try {
      const playerData = {
        ...req.body,
        tournamentId: req.params.tournamentId
      };
      const player = await playerService.createPlayer(playerData, req.user);
      this.handleSuccess(res, player, 'Player created successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPlayersByTournamentId(req, res) {
    try {
      const { tournamentId } = req.params;
      const { status, search } = req.query;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const players = await playerService.getPlayersByTournamentId(tournamentId, status, search, page, limit);
      this.handleSuccess(res, players, 'Players retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async approvePlayer(req, res) {
    console.log("aprove player", req.body)
    try {
      const { tournamentId, playerId } = req.params;
      const { approve } = req.body;
      const player = await tournamentService.approvePlayerInTournament(tournamentId, playerId, approve);
      if (player?.msg) {

        this.handleSuccess(res, player?.data, player?.msg);

      }
      this.handleSuccess(res, player?.data, `${approve ? "Player approved successfully" : "Player rejected successfully"}`);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async refundPlayer(req, res) {
    try {
      const { tournamentId, playerId } = req.params;
      const { refund } = req.body;
      const player = await tournamentService.refundPlayerInTournament(tournamentId, playerId, refund);
      this.handleSuccess(res, player, `${refund ? "Player refunded successfully" : "Player not refunded"}`);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPlayersOfTeamManager(req, res) {
    try {
      const teamManagerId = req.user.id;
      const players = await playerService.getPlayersOfTeamManager(teamManagerId);
      this.handleSuccess(res, players, 'Players retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createPlayerOfTeamManager(req, res) {
    try {
      const teamManagerId = req.user.id;
      const player = await playerService.createPlayerOfTeamManager(req.body, teamManagerId);
      this.handleSuccess(res, player, 'Player created successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async editPlayerOfTeamManager(req, res) {
    try {
      const { playerId } = req.params;
      const teamManagerId = req.user.id;
      const player = await playerService.editPlayerOfTeamManager(playerId, req.body, teamManagerId);
      this.handleSuccess(res, player, 'Player updated successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async removePlayerOfTeamManager(req, res) {
    try {
      const { playerId } = req.params;
      const teamManagerId = req.user.id;
      const player = await playerService.removePlayerOfTeamManager(playerId, teamManagerId);
      this.handleSuccess(res, player, 'Player removed successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = PlayerController; 