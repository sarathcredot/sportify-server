const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { PLAYER_STATUS } = require("../utils/constants");
const { Types } = require("mongoose");

class PlayerService {
  async registerPlayer(playerData) {
    let tournament = await Tournament.findById(playerData.tournamentId).populate('players.player');
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    if (new Date() > tournament.endDate) {
      throw new ValidationError("Tournament registration is closed");
    }

    const existingPlayer = tournament.players.find(player => {
      const populatedPlayer = player.player;
      return populatedPlayer && populatedPlayer.contactNumber === playerData.contactNumber;
    });
    if (existingPlayer) {
      throw new ValidationError("Player already registered in tournament");
    }

    let player = new Player({
      ...playerData,
      sport: tournament.sportType,
      dateOfBirth: new Date(playerData.dateOfBirth)
    });

    tournament.players.push({
      player: player._id,
      status: PLAYER_STATUS.PENDING,
    });

    await player.save();
    await tournament.save();
    return player;
  }

  async createPlayer(playerData) {
    let tournament = await Tournament.findById(playerData.tournamentId).populate('players.player');
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    const existingPlayer = tournament.players.find(player => {
      const populatedPlayer = player.player;
      return populatedPlayer && populatedPlayer.contactNumber === playerData.contactNumber;
    });
    if (existingPlayer) {
      throw new ValidationError("Player already registered in tournament");
    }

    let player = new Player({
      ...playerData,
      sport: tournament.sportType,
      dateOfBirth: new Date(playerData.dateOfBirth)
    });

    let words = tournament.name.split(' ');
    let prefix;
    if (words.length >= 3) {
      prefix = words
        .slice(0, 3)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    } else {
      prefix = words[0].substring(0, 3).toUpperCase();
    }
    
    let playerId = await this.generatePlayerId(tournament);
    
    tournament.players.push({
      playerId: playerId,
      player: player._id,
      status: PLAYER_STATUS.APPROVED,
    });

    await player.save();
    await tournament.save();
    return player;
  }

  async getPlayersByTournamentId(tournamentId, status) {
    let tournament = await Tournament.findById(tournamentId?.toString()).lean().populate('players.player').select(status ? { 'players': { $elemMatch: { status } } } : null) || null;
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }
    
    let players = tournament.players?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) ?? [];
    
    // Filter by status if provided
    if (status) {
      players = players.filter(player => player.status === status);
    }
    
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
