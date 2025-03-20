const playerService = require('../services/playerService');
const ResponseHandler = require('../utils/responseHandler');
const { PLAYER_STATUS } = require('../utils/constants');


class PlayerController {
  async registerPlayer(req, res) {
    try {
      const playerData = {
        ...req.body,
        tournamentId: req.params.tournamentId
      };
      
      const player = await playerService.registerPlayer(playerData, req.user);
      
      res.status(201).json(
        ResponseHandler.success('Player registered successfully', player)
      );
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json(ResponseHandler.error(error.message));
      }
      res.status(500).json(
        ResponseHandler.error('Error registering player', error.message, 500)
      );
    }
  }

  async createPlayer(req, res) {
    try {
      const playerData = {
        ...req.body,
        tournamentId: req.params.tournamentId
      };
      
      const player = await playerService.createPlayer(playerData, req.user);
      
      res.status(201).json(
        ResponseHandler.success('Player created successfully', player)
      );
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json(ResponseHandler.error(error.message));
      }
      res.status(500).json(
        ResponseHandler.error('Error creating player', error.message, 500)
      );
    }
  }

  async getPlayersByTournamentId(req, res) {
    try {
      const { tournamentId } = req.params;
      const players = await playerService.getPlayersByTournamentId(tournamentId);
      res.status(200).json(ResponseHandler.success('Players retrieved successfully', players));
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json(ResponseHandler.error(error.message));
      }
      res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
    }
  }

  async approvePlayer(req, res) {
    const { playerId } = req.params;
    const { approve } = req.body;

    const player = await playerService.approvePlayer(playerId, approve);
    res.status(200).json(ResponseHandler.success(`${approve ? "Player approved successfully": "Player rejected successfully"}`, player));
  }
}

module.exports = new PlayerController(); 