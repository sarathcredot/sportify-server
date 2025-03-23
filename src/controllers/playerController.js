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
      const players = await playerService.getPlayersByTournamentId(tournamentId, status, search);
      this.handleSuccess(res, players, 'Players retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async approvePlayer(req, res) {
    try {
      const { tournamentId, playerId } = req.params;
      const { approve } = req.body;
      const player = await tournamentService.approvePlayerInTournament(tournamentId, playerId, approve);
      this.handleSuccess(res, player, `${approve ? "Player approved successfully": "Player rejected successfully"}`);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = PlayerController; 