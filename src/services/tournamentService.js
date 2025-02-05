const Tournament = require('../models/Tournament');

async function createTournament(tournamentData, user) {
    const tournament = new Tournament({ ...tournamentData, createdBy: user._id });
    await tournament.save();
    return tournament;
}

async function getTournamentById(id) {
    const tournament = await Tournament.findById(id);
    return tournament;
}

async function updateTournamentById(id, updates) {
    const tournament = await Tournament.findByIdAndUpdate(id, updates, { new: true });
    return tournament;
}

async function deleteTournamentById(id) {
    const tournament = await Tournament.findByIdAndDelete(id);
    return tournament;
}

async function getOrganiserTournaments(user, sportType, location, search) {
    const filters = { createdBy: user._id };

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
    return tournaments;
}

module.exports = {
    createTournament,
    getTournamentById,
    updateTournamentById,
    deleteTournamentById,
    getOrganiserTournaments
};