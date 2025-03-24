const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { PLAYER_STATUS } = require("../utils/constants");
const { Types } = require("mongoose");

class PlayerService {
  async registerPlayer(playerData) {
    const tournament = await Tournament.findById(playerData.tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (new Date() > tournament.endDate) {
      throw new ValidationError("Tournament registration is closed");
    }

    // Check if player already registered
    const existingPlayer = await TournamentPlayers.findOne({
      tournament: tournament._id,
      'player.contactNumber': playerData.contactNumber
    }).populate('player');
    
    if (existingPlayer) {
      throw new ValidationError("Player already registered in tournament");
    }

    let player = new Player({
      ...playerData,
      sport: tournament.sportType,
      dateOfBirth: new Date(playerData.dateOfBirth)
    });

    await player.save();

    // Create tournament player entry
    await TournamentPlayers.create({
      tournament: tournament._id,
      player: player._id,
      status: PLAYER_STATUS.PENDING,
    });

    return player;
  }

  async createPlayer(playerData) {
    const tournament = await Tournament.findById(playerData.tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    // Check if player already registered
    const existingPlayer = await TournamentPlayers.findOne({
      tournament: tournament._id,
      'player.contactNumber': playerData.contactNumber
    }).populate('player');

    if (existingPlayer) {
      throw new ValidationError("Player already registered in tournament");
    }

    let player = new Player({
      ...playerData,
      sport: tournament.sportType,
      dateOfBirth: new Date(playerData.dateOfBirth)
    });

    let playerId = await this.generatePlayerId(tournament);
    
    await player.save();

    // Create tournament player entry
    await TournamentPlayers.create({
      tournament: tournament._id,
      playerId: playerId,
      player: player._id,
      status: PLAYER_STATUS.APPROVED,
    });

    return player;
  }

  async getPlayersByTournamentId(tournamentId, status, search) {
    let query = { tournament: tournamentId };
    if (status) {
      query.status = status;
    }
    if (search) {
      query.player.name = { $regex: search, $options: 'i' };
    }

    let players = await TournamentPlayers.find(query)
      .populate('player')
      .sort({ createdAt: -1 });
    
    return players;
  }

  async generatePlayerId(tournament) {
    let words = tournament.name.split(' ');
    let prefix;
    if (tournament.playerIdPrefix) {
      prefix = tournament.playerIdPrefix;
    } else {
      if (words.length >= 3) {
        prefix = words
          .slice(0, 3)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    } else {
        prefix = words[0].substring(0, 3).toUpperCase();
      } 
    }

    tournament.playerIdCounter = (tournament.playerIdCounter || 0) + 1;
    if (tournament.playerIdPrefix !== prefix) {
      tournament.playerIdCounter = 0;
    } 
    let playerId = prefix + String(tournament.playerIdCounter).padStart(4, '0');
    tournament.playerIdPrefix = prefix;
    await tournament.save();
    return playerId;
  }
}

module.exports = new PlayerService();
