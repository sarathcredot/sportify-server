const tournamentService = require('../services/tournamentService');
const teamService = require('../services/teamService');
const playerService = require('../services/playerService');
const ResponseHandler = require('../utils/responseHandler');
const BaseController = require('./baseController');


class TournamentController extends BaseController {
  constructor() {
    super();
    this.createTournament = this.createTournament.bind(this);
    this.getTournamentById = this.getTournamentById.bind(this);
    this.updateTournamentById = this.updateTournamentById.bind(this);
    this.deleteTournamentById = this.deleteTournamentById.bind(this);
    this.getOrganiserTournaments = this.getOrganiserTournaments.bind(this);
    this.getTournaments = this.getTournaments.bind(this);
    this.getTeamsByTournamentId = this.getTeamsByTournamentId.bind(this);
    this.getTeamManagerTournaments = this.getTeamManagerTournaments.bind(this);
    this.getLatestTournaments = this.getLatestTournaments.bind(this);
  }

  async createTournament(req, res) {
    try {
      // console.log("create tour", req.body)
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

  async getTournamentForTeamManagerById(req, res) {
    try {
      const tournament = await tournamentService.getTournamentForTeamManagerById(req.params.id, req.user);
      res.status(200).json(ResponseHandler.success('Tournament retrieved', tournament));
    } catch (error) {
      console.log("get tour byid", error)
      this.handleError(res, error);
    }
  }

  async getTournamentByIdPoster(req, res) {
    try {

      console.log("get tour byid poster>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", req.params.id)

      const tournament = await tournamentService.getTournamentByIdPoster(req.params.id);
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
      console.log(id, ' = PARAMS.ID')
      console.log(updates, ' = REQ.BODY')
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
      const { sportType, location, search, page, limit } = req.query;
      const user = req.user;
      const tournaments = await tournamentService.getOrganiserTournaments(user._id, sportType, location, search, parseInt(page), parseInt(limit));
      res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeamManagerTournaments(req, res) {
    try {
      const { search, page, limit } = req.query;
      const user = req.user;
      const tournaments = await tournamentService.getTeamManagerTournaments(user._id, search, parseInt(page), parseInt(limit));
      res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTournaments(req, res) {
    try {
      const { search, organiserId, statusList, sportTypes, locations, feesType, page = 1, limit = 10, skip = "false" } = req.query;
      console.log("tour", req.query)
      const tournaments = await tournamentService.getTournaments(
        search,
        organiserId,
        statusList,
        sportTypes,
        locations,
        feesType,
        parseInt(page),
        parseInt(limit),
        skip === 'true' ? true : false
      );
      res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTeamsByTournamentId(req, res) {
    try {
      const { id } = req.params;
      const { status, search, page, limit } = req.query;
      const teams = await teamService.getTeamsByTournamentId(id, status, search, parseInt(page), parseInt(limit));
      res.status(200).json(ResponseHandler.success('Teams retrieved successfully', teams));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPlayersByTournamentId(req, res) {
    try {
      const { id } = req.params;
      const { status, search, page, limit } = req.query;
      const players = await playerService.getPlayersByTournamentId(id, status, search, parseInt(page), parseInt(limit));
      res.status(200).json(ResponseHandler.success('Players retrieved successfully', players));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getLatestTournaments(req, res) {
    try {
      console.log("get latest tournaments>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.")

      const tournaments = await tournamentService.getLatestTournaments();
      this.handleSuccess(res, tournaments, "Latest tournaments retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }


}

module.exports = TournamentController;
