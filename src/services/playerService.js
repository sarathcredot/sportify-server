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

    let playerId = await this.generatePlayerId(tournament);
    // Create tournament player entry
    await TournamentPlayers.create({
      tournament: tournament._id,
      player: player._id,
      playerId: playerId,
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
    await player.save();

    let playerId = await this.generatePlayerId(tournament);
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

    let players = await TournamentPlayers.find(query)
      .populate('player')
      .sort({ createdAt: -1 });

    if (search) {
      players = players.filter(player => 
        player.player.firstName.toLowerCase().includes(search.toLowerCase()) || 
        player.player.lastName.toLowerCase().includes(search.toLowerCase()) ||
        player.player.contactNumber.toLowerCase().includes(search.toLowerCase()) ||
        player.player.email.toLowerCase().includes(search.toLowerCase())
        // player.playerId.toLowerCase().includes(search.toLowerCase())
      );
    }
    return players;
  }

  async generatePlayerId(tournament) {
    let words = tournament.name.split(' ');
    let prefix;
    if (tournament.idPrefix) {
      prefix = tournament.idPrefix;
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
    if (tournament.idPrefix !== prefix) {
      tournament.playerIdCounter = 0;
    }
    let playerId = prefix + 'P' + String(tournament.playerIdCounter).padStart(4, '0');
    tournament.idPrefix = prefix;
    await tournament.save();
    return playerId;
  }
}

module.exports = new PlayerService();
