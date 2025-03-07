const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { PLAYER_STATUS } = require("../utils/constants");
const { Types } = require("mongoose");

class PlayerService {
  async registerPlayer(playerData, user) {
    const tournament = await Tournament.findById(playerData.tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (new Date() > tournament.endDate) {
      throw new ValidationError("Tournament registration is closed");
    }

    if (playerData.sport !== tournament.sportType) {
      throw new ValidationError(
        "Player sport type does not match tournament sport type"
      );
    }

    const player = new Player({
      ...playerData,
      dateOfBirth: new Date(playerData.dateOfBirth),
      tournament: tournament._id,
      status: PLAYER_STATUS.PENDING,
    });

    await player.save();
    return player;
  }

  async getPlayersByTournamentId(tournamentId) {
    const players = await Player.find({ tournament: new Types.ObjectId(tournamentId) }).sort({
      createdAt: -1,
    });
    return players;
  }

  async approvePlayer(playerId, approve) {
    const player = await Player.findById(playerId);
    player.status = approve ? PLAYER_STATUS.APPROVED : PLAYER_STATUS.REJECTED;
    await player.save();
    return player;
  }
}

module.exports = new PlayerService();
