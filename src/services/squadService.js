const Squad = require("../models/Squad");

class SquadService {

  async createSquad(squadData) {
    const squad = new Squad(squadData);
    await squad.save();
    return Squad.findById(squad._id).populate("players");
  }

  async getSquadsOfTeamManager(teamManagerId) {
    const squads = await Squad.find({ teamManager: teamManagerId }).populate("players");
    return squads;
  }

  async updateSquad(squadId, squadData) {
    const squad = await Squad.findById(squadId);
    if (!squad) {
      throw new NotFoundError("Squad not found");
    }
    squad.name = squadData.name;
    squad.players = squadData.players;
    await squad.save();
    return Squad.findById(squadId).populate("players");
  }

  async deleteSquad(squadId, teamManagerId) {
    const squad = await Squad.findById({ _id: squadId, teamManager: teamManagerId });
    if (!squad) {
      throw new NotFoundError("Squad not found");
    }
    await Squad.findByIdAndDelete({ _id: squadId, teamManager: teamManagerId });
  }
}

module.exports = new SquadService();
