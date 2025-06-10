const ResponseHandler = require("../utils/responseHandler");
const BaseController = require('./baseController');
const tournamentService = require("../services/tournamentService");
const userService = require("../services/userService");
const { ROLES } = require("../utils/constants");

class OrganiserController extends BaseController {

  constructor() {
    super();
    this.getAllOrganisersPaginated = this.getAllOrganisersPaginated.bind(this);
    this.getOrganiserById = this.getOrganiserById.bind(this);
    this.updateOrganiserById = this.updateOrganiserById.bind(this);
    this.deleteOrganiserById = this.deleteOrganiserById.bind(this);
    this.getTournamentsByOrganiserId = this.getTournamentsByOrganiserId.bind(this);
    this.toggleStatus = this.toggleStatus.bind(this);
    this.getOrganiserProfile = this.getOrganiserProfile.bind(this)
    this.updateOrganiserProfile=this.updateOrganiserProfile.bind(this)
  }

  async getOrganiserDashboard(req, res) {
    try {
      const organiser = req.user;
      const tournaments = await tournamentService.getOrganiserTournamentsCount(organiser._id);

      const dashboardData = {
        totalTournaments: tournaments.length,
        // Add more dashboard metrics as needed
      };

      res.status(200).json(ResponseHandler.success("Dashboard data retrieved successfully", dashboardData));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAllOrganisersPaginated(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const organisers = await userService.getAllUsersPaginated(search, page, limit, ROLES.ORGANISER);
      this.handleSuccess(res, organisers, "Organisers retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getOrganiserById(req, res) {
    try {
      const organiser = await userService.getUserById(req.params.id, ROLES.ORGANISER);
      this.handleSuccess(res, organiser, "Organiser retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateOrganiserById(req, res) {
    try {
      const organiser = await userService.updateUserById(req.params.id, req.body, ROLES.ORGANISER);
      this.handleSuccess(res, organiser, "Organiser updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getTournamentsByOrganiserId(req, res) {
    try {
      const { search, page, limit } = req.query;
      const { id } = req.params;
      const tournaments = await tournamentService.getOrganiserTournaments(id, "", "", search, parseInt(page), parseInt(limit));
      this.handleSuccess(res, tournaments, "Organiser tournaments retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteOrganiserById(req, res) {
    try {
      const organiser = await userService.deleteUserById(req.params.id, ROLES.ORGANISER);
      this.handleSuccess(res, organiser, "Organiser deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const organiser = await userService.toggleStatus(id, isActive);
      this.handleSuccess(res, organiser, "Status toggled successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }


  async getOrganiserProfile(req, res) {

    try {
      const user = req.user
      const organiser = await userService.getUserById(user?.id, ROLES.ORGANISER);
      this.handleSuccess(res, organiser, "Organiser retrieved successfully");

    } catch (error) {

      this.handleError(res, error);

    }
  }


  async updateOrganiserProfile(req, res) {

    try {
      const user=req.user
      const organiser = await userService.u(user?.id, req.body, ROLES.ORGANISER);
      this.handleSuccess(res, organiser, "Organiser updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }

  }


}

module.exports = OrganiserController;