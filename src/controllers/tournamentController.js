const tournamentService = require('../services/tournamentService');

async function createTournament(req, res) {
  try {
    const tournamentData = req.body;
    const user = req.user;
    const tournament = await tournamentService.createTournament(tournamentData, user);
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTournamentById(req, res) {
  try {
    const { id } = req.params;
    const tournament = await tournamentService.getTournamentById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateTournamentById(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tournament = await tournamentService.updateTournamentById(id, updates);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteTournamentById(req, res) {
  try {
    const { id } = req.params;
    const tournament = await tournamentService.deleteTournamentById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.status(200).json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getOrganiserTournaments(req, res) {
  try {
    const { sportType, location, search } = req.query;
    const user = req.user;
    const tournaments = await tournamentService.getOrganiserTournaments(user, sportType, location, search);
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createTournament,
  getTournamentById,
  updateTournamentById,
  deleteTournamentById,
  getOrganiserTournaments
};
