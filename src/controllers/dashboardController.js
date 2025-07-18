const dashboardService = require('../services/dashboardService');
const ResponseHandler = require('../utils/responseHandler');

class DashboardController {
  /**
   * Get dashboard statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboardStats(req, res) {
    try {
      const stats = await dashboardService.getDashboardStats();
      
      const response = ResponseHandler.success('Dashboard statistics retrieved successfully', stats);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve dashboard statistics', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get top organizers by tournament count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTopOrganizers(req, res) {
    try {
      const { limit = 10 } = req.query;
      const topOrganizers = await dashboardService.getTopOrganizers(parseInt(limit));
      
      const response = ResponseHandler.success('Top organizers retrieved successfully', topOrganizers);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve top organizers', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get organizer statistics with time-based filtering and chart data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrganizerStats(req, res) {
    try {
      const { filterType = 'month', year = new Date().getFullYear() } = req.query;
      
      const organizerStats = await dashboardService.getOrganizerStats(filterType, parseInt(year));
      
      const response = ResponseHandler.success('Organizer statistics retrieved successfully', organizerStats);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve organizer statistics', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get recent activity for dashboard
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecentActivity(req, res) {
    try {
      const { limit = 10 } = req.query;
      const activity = await dashboardService.getRecentActivity(parseInt(limit));
      
      const response = ResponseHandler.success('Recent activity retrieved successfully', activity);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve recent activity', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get complete dashboard data (stats + recent activity)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboardData(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const [stats, activity] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(parseInt(limit))
      ]);
      
      const response = ResponseHandler.success('Dashboard data retrieved successfully', {
        statistics: stats,
        recentActivity: activity
      });
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve dashboard data', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get top team managers by tournament count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTopTeamManagers(req, res) {
    try {
      const { limit = 10 } = req.query;
      const topTeamManagers = await dashboardService.getTopTeamManagers(parseInt(limit));
      
      const response = ResponseHandler.success('Top team managers retrieved successfully', topTeamManagers);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve top team managers', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get team manager statistics with time-based filtering and chart data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTeamManagerStats(req, res) {
    try {
      const { filterType = 'month', year = new Date().getFullYear() } = req.query;
      
      const teamManagerStats = await dashboardService.getTeamManagerStats(filterType, parseInt(year));
      
      const response = ResponseHandler.success('Team manager statistics retrieved successfully', teamManagerStats);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve team manager statistics', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get top tournaments by participant count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTopTournaments(req, res) {
    try {
      const { limit = 10 } = req.query;
      const topTournaments = await dashboardService.getTopTournaments(parseInt(limit));
      
      const response = ResponseHandler.success('Top tournaments retrieved successfully', topTournaments);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve top tournaments', error);
      return res.status(response.statusCode).json(response);
    }
  }

  /**
   * Get tournament statistics with time-based filtering and chart data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTournamentStats(req, res) {
    try {
      const { filterType = 'month', year = new Date().getFullYear() } = req.query;
      
      const tournamentStats = await dashboardService.getTournamentStats(filterType, parseInt(year));
      
      const response = ResponseHandler.success('Tournament statistics retrieved successfully', tournamentStats);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = ResponseHandler.error('Failed to retrieve tournament statistics', error);
      return res.status(response.statusCode).json(response);
    }
  }
}

module.exports = new DashboardController(); 