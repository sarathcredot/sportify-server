import Tournament, { findById, findByIdAndUpdate, findByIdAndDelete } from '../models/Tournament';

export async function createTournament(req, res) {
  try {
    const { name, location, date } = req.body;
    const tournament = new Tournament({ name, location, date });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTournamentById(req, res) {
  try {
    const { id } = req.params;
    const tournament = await findById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateTournamentById(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tournament = await findByIdAndUpdate(id, updates, { new: true });
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteTournamentById(req, res) {
  try {
    const { id } = req.params;
    const tournament = await findByIdAndDelete(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.status(200).json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}