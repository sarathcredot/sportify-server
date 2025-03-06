const tournamentService = require('../services/tournamentService');
const ResponseHandler = require('../utils/responseHandler');
const BaseController = require('./baseController');

class TournamentController extends BaseController {
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
      this.handleError(res, error);
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
      this.handleError(res, error);
    }
  }

  async getOrganiserTournaments(req, res) {
    try {
      const { sportType, location, search } = req.query;
      const user = req.user;
      const tournaments = await tournamentService.getOrganiserTournaments(user, sportType, location, search);
      res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new TournamentController();
