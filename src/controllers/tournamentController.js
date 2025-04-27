const tournamentService = require('../services/tournamentService');
const ResponseHandler = require('../utils/responseHandler');
const BaseController = require('./baseController');

class TournamentController extends BaseController {
  constructor() {
    super();
    // Bind all methods to preserve 'this' context
    this.createTournament = this.createTournament.bind(this);
    this.getTournamentById = this.getTournamentById.bind(this);
    this.updateTournamentById = this.updateTournamentById.bind(this);
    this.deleteTournamentById = this.deleteTournamentById.bind(this);
    this.getOrganiserTournaments = this.getOrganiserTournaments.bind(this);
    this.getTournaments = this.getTournaments.bind(this);
  }

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
      console.log("get tour byid", error)
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
      const { sportType, location, search, page = 1, limit = 10 } = req.query;
      const user = req.user;
      const tournaments = await tournamentService.getOrganiserTournaments(user._id, sportType, location, search, parseInt(page), parseInt(limit));
      res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTournaments(req, res) {
    try {
      const { search, organiserId, page = 1, limit = 10 } = req.query;
      const tournaments = await tournamentService.getTournaments(
        search,
        organiserId,
        parseInt(page),
        parseInt(limit)
      );
      res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = TournamentController;
