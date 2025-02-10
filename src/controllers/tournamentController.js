const tournamentService = require('../services/tournamentService');
const ResponseHandler = require('../utils/responseHandler');

class TournamentController {
  async createTournament(req, res) {
    try {
      const tournament = await tournamentService.createTournament(req.body, req.user);
      res.status(201).json(ResponseHandler.success('Tournament created', tournament));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTournamentById(req, res) {
    try {
      const tournament = await tournamentService.getTournamentById(req.params.id);
      res.status(200).json(ResponseHandler.success('Tournament retrieved', tournament));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateTournamentById(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const tournament = await tournamentService.updateTournamentById(id, updates);
      if (!tournament) {
        return res.status(404).json(ResponseHandler.error('Tournament not found', null, 404));
      }
      res.status(200).json(ResponseHandler.success('Tournament updated successfully', tournament));
    } catch (error) {
      res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
    }
  }

  async deleteTournamentById(req, res) {
    try {
      const { id } = req.params;
      const tournament = await tournamentService.deleteTournamentById(id);
      if (!tournament) {
        return res.status(404).json(ResponseHandler.error('Tournament not found', null, 404));
      }
      res.status(200).json(ResponseHandler.success('Tournament deleted successfully', null));
    } catch (error) {
      res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
    }
  }

  async getOrganiserTournaments(req, res) {
    try {
      const { sportType, location, search } = req.query;
      const user = req.user;
      const tournaments = await tournamentService.getOrganiserTournaments(user, sportType, location, search);
      res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
    } catch (error) {
      res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
    }
  }

  handleError(res, error) {
    const errorMap = {
      ValidationError: 400,
      NotFoundError: 404,
      UnauthorizedError: 401,
    };
    
    const statusCode = errorMap[error.name] || 500;
    res.status(statusCode).json(
      ResponseHandler.error(error.message, null, statusCode)
    );
  }
}

module.exports = new TournamentController();
