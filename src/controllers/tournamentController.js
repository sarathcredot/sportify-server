const tournamentService = require('../services/tournamentService');
const ResponseHandler = require('../utils/responseHandler');

async function createTournament(req, res) {
  try {
    const tournamentData = req.body;
    const user = req.user;
    const tournament = await tournamentService.createTournament(tournamentData, user);
    res.status(201).json(ResponseHandler.success('Tournament created successfully', tournament));
  } catch (error) {
    res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
  }
}

async function getTournamentById(req, res) {
  try {
    const { id } = req.params;
    const tournament = await tournamentService.getTournamentById(id);
    if (!tournament) {
      return res.status(404).json(ResponseHandler.error('Tournament not found', null, 404));
    }
    res.status(200).json(ResponseHandler.success('Tournament retrieved successfully', tournament));
  } catch (error) {
    res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
  }
}

async function updateTournamentById(req, res) {
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

async function deleteTournamentById(req, res) {
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

async function getOrganiserTournaments(req, res) {
  try {
    const { sportType, location, search } = req.query;
    const user = req.user;
    const tournaments = await tournamentService.getOrganiserTournaments(user, sportType, location, search);
    res.status(200).json(ResponseHandler.success('Tournaments retrieved successfully', tournaments));
  } catch (error) {
    res.status(500).json(ResponseHandler.error('Server error', error.message, 500));
  }
}

module.exports = {
  createTournament,
  getTournamentById,
  updateTournamentById,
  deleteTournamentById,
  getOrganiserTournaments
};
