const { getIO } = require("../config/socket");
const User = require("../models/User");
const TournamentTeams = require("../models/TournamentTeams");
const { ROLES, TEAM_STATUS } = require("../utils/constants");
const { logger } = require("../config/logger");

class SocketService {
  constructor() {
    this._io = null;
  }

  get io() {
    if (!this._io) {
      this._io = getIO();
    }
    return this._io;
  }

  sendMessage(room, message) {
    this.io.to(room).emit("message", message);
  }

  sendMessageToAll(message) {
    this.io.emit("message", message);
  }

  sendMessageToUser(userId, message) {
    this.io.to(userId).emit("message", message);
  }

  sendMessageToRoom(room, message) {
    this.io.to(room).emit("message", message);
  }

  sendMessageToAllRooms(message) {
    this.io.emit("message", message);
  }

  sendMessageToUsers(userIds, event, message) {
    userIds.forEach((userId) => {
      try {
        this.io.to(userId).emit(event, message);
      } catch (error) {
        logger.error("Socket event failed to send message to user", {
          userId,
          event,
          message,
        });
      }
    });
  }

  async sendMessageToAllTeamManagersInTournament(tournamentId, event, message) {
    const tournamentTeams = await TournamentTeams.find({
      tournament: tournamentId,
      status: TEAM_STATUS.APPROVED
    });
    const teamManagers = tournamentTeams.map((team) =>
      team.teamManager.toString()
    );
    this.sendMessageToUsers(teamManagers, event, message);
  }
}

module.exports = new SocketService();
