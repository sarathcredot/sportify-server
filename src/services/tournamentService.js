const Tournament = require("../models/Tournament");
const Auction = require("../models/Auction");
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { ROLES, PLAYER_STATUS } = require('../utils/constants');


class TournamentService {

  async createTournament(tournamentData, user) {
    this.validateTournamentData(tournamentData);

    let auction = new Auction(tournamentData?.auction);

    auction = await auction.save();
    console.log(auction?._id, 'AUCTION ID')
    let obj = {
      ...tournamentData,
      auction: auction?._id,
      organiser: user._id,
      createdBy: user?._id
    }

    if(auction?._id){
      obj.auction = auction?._id 
    }
    
    const tournament = new Tournament(obj);
    return await tournament.save();
  }

  async getTournamentById(id) {
    const tournament = await Tournament.findById(id)
      .populate('auction');

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

  async approvePlayerInTournament(tournamentId, playerId, approve) {
    const tournament = await Tournament.findOneAndUpdate(
      {
        _id: tournamentId,
        'players.player': playerId
      },
      {
        $set: {
          'players.$.status': approve ? PLAYER_STATUS.APPROVED : PLAYER_STATUS.REJECTED
        }
      },
      { new: true }
    );
    if (!tournament) {
      throw new NotFoundError('Tournament or player not found');
    }
    return tournament;
  }

  validateTournamentData(data) {
    if (new Date(data.startDate) < new Date()) {
      throw new ValidationError('Start date cannot be in the past');
    }
  }

  canUserModifyTournament(tournament, user) {
    return tournament.organiser.toString() === user._id.toString() ||
           user.role === ROLES.ADMIN;
  }

  async validateUpdateData(updateData) {
    // Implementation of validateUpdateData method
  }
}

module.exports = new TournamentService();
