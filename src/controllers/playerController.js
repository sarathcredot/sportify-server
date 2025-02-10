const playerService = require('../services/playerService');
const ResponseHandler = require('../utils/responseHandler');

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
}

module.exports = new PlayerController(); 