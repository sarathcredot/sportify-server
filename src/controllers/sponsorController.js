const ResponseHandler = require("../utils/responseHandler");
const BaseController = require('./baseController');
const sponsorService = require("../services/sponsorService");

class SponsorController extends BaseController {

  constructor() {
    super();
    this.createSponsor = this.createSponsor.bind(this);
    this.getSponsorsByTournamentId = this.getSponsorsByTournamentId.bind(this);
    this.updateSponsor = this.updateSponsor.bind(this);
    this.deleteSponsor = this.deleteSponsor.bind(this);
    this.getSponsorsById=this.getSponsorsById.bind(this)
  }

  async createSponsor(req, res) {
    console.log("creta sponser")
    try {
      const sponsor = await sponsorService.createSponsor(req.body, req.params.tournamentId);
      this.handleSuccess(res, sponsor, "Sponsor created successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getSponsorsByTournamentId(req, res) {
    try {
      const { id } = req.params;
      console.log("get sponser common",id)
      const { page, limit, search } = req.query;
      const sponsors = await sponsorService.getSponsorsByTournamentId(id, parseInt(page), parseInt(limit), search);
      this.handleSuccess(res, sponsors, "Sponsors retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateSponsor(req, res) {
    try {
      const { sponsorId } = req.params;
      const sponsor = await sponsorService.updateSponsor(sponsorId, req.body);
      this.handleSuccess(res, sponsor, "Sponsor updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteSponsor(req, res) {
    try {
      const { sponsorId } = req.params;
      await sponsorService.deleteSponsor(sponsorId);
      this.handleSuccess(res, null, "Sponsor deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getSponsorsById(req, res) {
    try {
      const {id } = req.params;
      console.log("get sponser common",tournamentId)
      const { page, limit, search } = req.query;
      const sponsors = await sponsorService.getSponsorsByTournamentId(id, parseInt(page), parseInt(limit), search);
      this.handleSuccess(res, sponsors, "Sponsors retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

}

module.exports = SponsorController;