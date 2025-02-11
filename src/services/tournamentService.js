const Tournament = require("../models/Tournament");
const Auction = require("../models/Auction");
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');

class TournamentService {

  async createTournament(tournamentData, user) {
    this.validateTournamentData(tournamentData);
    
    const tournament = new Tournament({
      ...tournamentData,
      organiser: user._id,
    });
    return await tournament.save();
  }

  async getTournamentById(id) {
    const tournament = await Tournament.findById(id)
      .populate('organiser', 'name email');

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    return tournament;
  }

  async updateTournament(id, updateData, user) {
    const tournament = await this.getTournamentById(id);
    
    if (!this.canUserModifyTournament(tournament, user)) {
      throw new UnauthorizedError('Not authorized to modify this tournament');
    }

    this.validateUpdateData(updateData);
    
    return await Tournament.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async getOrganiserTournaments(user, sportType, location, search) {
    const query = { createdBy: user._id };
    
    if (sportType) {
      query.sportType = sportType;
    }
    
    if (location) {
      query.location = location;
    }
    
    if (search) {
      query.name = { $regex: String(search).trim(), $options: 'i' };
    }

    const tournaments = await Tournament.find(query);
    return tournaments;
  }

  validateTournamentData(data) {
    if (new Date(data.startDate) < new Date()) {
      throw new ValidationError('Start date cannot be in the past');
    }
  }

  canUserModifyTournament(tournament, user) {
    return tournament.organiser.toString() === user._id.toString() ||
           user.role === 'admin';
  }

  async validateUpdateData(updateData) {
    // Implementation of validateUpdateData method
  }
}

module.exports = new TournamentService();
