const squadService = require('../services/squadService');
const BaseController = require('./baseController');

class SquadController extends BaseController {

  constructor() {
    super();
    this.createSquad = this.createSquad.bind(this);
    this.getSquadsOfTeamManager = this.getSquadsOfTeamManager.bind(this);
    this.updateSquad = this.updateSquad.bind(this);
    this.deleteSquad = this.deleteSquad.bind(this);
  }

  async createSquad(req, res) {
    try {
      const squadData = {
        ...req.body,
        teamManager: req.user.id
      };
      const squad = await squadService.createSquad(squadData);
      this.handleSuccess(res, squad, 'Squad created successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getSquadsOfTeamManager(req, res) {
    try {
      const teamManagerId = req.user.id;
      const squads = await squadService.getSquadsOfTeamManager(teamManagerId);
      this.handleSuccess(res, squads, 'Squads retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateSquad(req, res) {
    try {
      const { squadId } = req.params;
      const squadData = {
        ...req.body,
        teamManager: req.user.id
      };
      const squad = await squadService.updateSquad(squadId, squadData);
      this.handleSuccess(res, squad, 'Squad updated successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteSquad(req, res) {
    try {
      const { squadId } = req.params;
      const teamManagerId = req.user.id;
      const squad = await squadService.deleteSquad(squadId, teamManagerId);
      this.handleSuccess(res, squad, 'Squad deleted successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = SquadController; 