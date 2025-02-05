const Tournament = require('../models/Tournament');
const { findById, findByIdAndUpdate, findByIdAndDelete } = require('../models/Tournament');

async function createTournament(req, res) {
  try {
    const tournamentData = req.body;
    const user = req.user;
    const tournament = new Tournament({ ...tournamentData, organiser: user._id });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTournamentById(req, res) {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);
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
    const tournament = await Tournament.findByIdAndUpdate(id, updates, { new: true });
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
    const tournament = await Tournament.findByIdAndDelete(id);
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
    const filters = { createdBy: req.user._id };

    if (sportType) {
      filters.sportType = sportType;
    }
    if (location) {
      filters.location = new RegExp(location, 'i'); // Case-insensitive regex search
    }
    if (search) {
      filters.name = new RegExp(search, 'i'); // Case-insensitive regex search
    }

    const tournaments = await Tournament.find(filters);
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