const Tournament = require("../models/Tournament");

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
  const tournament = await Tournament.findByIdAndUpdate(id, updates, {
    new: true,
  });
  return tournament;
}

async function deleteTournamentById(id) {
  const tournament = await Tournament.findByIdAndDelete(id);
  return tournament;
}

async function getOrganiserTournaments(
  user,
  sportType,
  location,
  search,
  isOngoing
) {
  const filters = { createdBy: user._id };

  if (sportType) {
    filters.sportType = sportType;
  }
  if (location) {
    filters.location = new RegExp(location, "i");
  }
  if (search) {
    filters.name = new RegExp(search, "i");
  }

  const currentDate = new Date();
  
  const dateFilter =
    isOngoing !== undefined
      ? isOngoing
        ? { startDate: { $lte: currentDate }, endDate: { $gte: currentDate } }
        : {
            $or: [
              { startDate: { $gt: currentDate } },
              { endDate: { $lt: currentDate } },
            ],
          }
      : {};

  const tournaments = await Tournament.find({ ...filters, ...dateFilter });

  return tournaments.map((tournament) => ({
    ...tournament.toObject(),
    isOnGoing:
      currentDate >= tournament.startDate && currentDate <= tournament.endDate,
  }));
}

module.exports = {
  createTournament,
  getTournamentById,
  updateTournamentById,
  deleteTournamentById,
  getOrganiserTournaments,
};
