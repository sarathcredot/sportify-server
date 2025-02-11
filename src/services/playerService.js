const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { uploadFile } = require('./uploadService');

class PlayerService {
  async registerPlayer(playerData, user) {

    const tournament = await Tournament.findById(playerData.tournamentId);
    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    if (new Date() > tournament.endDate) {
      throw new ValidationError('Tournament registration is closed');
    }

    if (playerData.sport !== tournament.sportType) {
      throw new ValidationError('Player sport type does not match tournament sport type');
    }

    const player = new Player({
      ...playerData,
      dateOfBirth: new Date(playerData.dateOfBirth),
      tournament: tournament._id,
      status: 'pending'
    });

    await player.save();
    return player;
  }
}

module.exports = new PlayerService(); 