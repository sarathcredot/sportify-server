const Player = require("../models/Player");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const TournamentPlayers = require("../models/TournamentPlayers");
const TeamManagerPlayer = require("../models/TeamManagerPlayer");
const TeamManagerTeam = require("../models/TournamentTeams");
const mongoose = require("mongoose")

const { ValidationError, NotFoundError } = require("../utils/errors");
const { PLAYER_STATUS } = require("../utils/constants");
const { Types } = require("mongoose");
const notificationService = require("./notificationService");
const { sendEmail } = require("./emailService");
const TournamentTeams = require("../models/TournamentTeams");

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
      firstName: player.firstName,
      lastName: player.lastName,
      contactNumber: player.contactNumber,
      email: player.email,
    });

    // Notify tournament organizer about new player registration

    await notificationService.sendNotificationToOrganizer({
      tournamentId: tournament._id,
      type: "player_register"
    });

    // sent email to player
    console.log("Sending email");
    await sendEmail(player.email, "Player Registration Confirmation",

      {
        title: "Player Registration Confirmation",
        name: player.firstName,
        des: `You have successfully registered for the tournament: ${tournament.name}. Your Player ID is ${playerId}.`,
      }


    );

    return player;
  }

  async createPlayer(playerData) {
    console.log("plyer data", playerData)
    const tournament = await Tournament.findById(playerData.tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }

    const maxPlayersAllowed = tournament?.settings?.maxPlayersAllowed

    const tournamentPlayers = await TournamentPlayers.find({ tournament: tournament?._id, status: PLAYER_STATUS.APPROVED })

    if (tournamentPlayers && tournamentPlayers.length === maxPlayersAllowed) {
      throw new NotFoundError("Maximum allowed players reached");
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
      firstName: player.firstName,
      lastName: player.lastName,
      contactNumber: player.contactNumber,
      email: player.email,
    });

    await sendEmail(player.email, "Player Registration Confirmation",

      {
        title: "Player Registration Confirmation",
        name: player.firstName,
        des: `You have successfully registered for the tournament: ${tournament.name}. Your Player ID is ${playerId}.`,
      }


    );

    return player;
  }

  async getPlayersByTournamentId(tournamentId, status, search, page = 1, limit = 10) {
    console.log("player", search)
    let query = { tournament: tournamentId };
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { playerId: { $regex: search, $options: 'i' } }

      ];
    }

    const skip = (page - 1) * limit;

    const [players, total] = await Promise.all([
      TournamentPlayers.find(query)
        .populate('player')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TournamentPlayers.countDocuments(query)
    ]);

    return {
      players: players,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPlayersByTournamentIdCommon(tournamentId, status, search, page = 1, limit = 10) {
    console.log("player", search)
    let query = { tournament: tournamentId };
    if (status) {
      query.status = { $nin: [PLAYER_STATUS.PENDING, PLAYER_STATUS.REFUNDED, PLAYER_STATUS.REJECTED] };
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { playerId: { $regex: search, $options: 'i' } }

      ];
    }

    const skip = (page - 1) * limit;

    const [players, total] = await Promise.all([
      TournamentPlayers.find(query)
        .populate('player')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TournamentPlayers.countDocuments(query)
    ]);

    return {
      players: players,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
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

  async getPlayersOfTeamManager(teamManagerId) {
    return await TeamManagerPlayer.find({ teamManager: teamManagerId });
  }

  async createPlayerOfTeamManager(playerData, teamManagerId) {
    const player = await TeamManagerPlayer.create({ ...playerData, teamManager: teamManagerId });
    return player;
  }

  async editPlayerOfTeamManager(playerId, playerData, teamManagerId) {
    const player = await TeamManagerPlayer.findOneAndUpdate({ _id: playerId, teamManager: teamManagerId }, { ...playerData });
    if (!player) {
      throw new NotFoundError("Player not found");
    }
    return player;
  }

  async editPlayerOfAdmin(playerId, playerData, teamManagerId) {
    const player = await Player.findOneAndUpdate({ _id: playerId, }, { ...playerData }, { new: true });
    if (!player) {
      throw new NotFoundError("Player not found");
    }
    return player;
  }

  async getPlayerById(playerId) {

    const objectId = new mongoose.Types.ObjectId(playerId);

    const player = TournamentPlayers.findById({_id:playerId}).populate("player")
    if (!player) {
      throw new NotFoundError("Player not found");
    }
    return player;
  }

  async deletePlayer(playerId) {
    const objectId = new mongoose.Types.ObjectId(playerId);

    const updatedTeam = await TournamentTeams.findOneAndUpdate(
      { "players.player": objectId }, // Ensure you're matching by ObjectId
      { $pull: { players: { player: objectId } } },
      { new: true }
    );



    if (!updatedTeam) {
      throw new NotFoundError("Player not found in any team");
    }

    return updatedTeam;
  }



  async removePlayerOfTeamManager(playerId, teamManagerId) {
    const player = await TeamManagerPlayer.findOneAndDelete({ _id: playerId, teamManager: teamManagerId });
    if (!player) {
      throw new NotFoundError("Player not found");
    }
    return player;
  }

}

module.exports = new PlayerService();
