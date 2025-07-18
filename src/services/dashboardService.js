const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Auction = require('../models/Auction');
const { ROLES } = require('../utils/constants');

class DashboardService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      // Get total counts
      const [
        totalOrganisers,
        totalTeamManagers,
        totalTournaments,
        totalAuctions
      ] = await Promise.all([
        User.countDocuments({ role: ROLES.ORGANISER, isActive: true }),
        User.countDocuments({ role: ROLES.TEAM_MANAGER, isActive: true }),
        Tournament.countDocuments(),
        Auction.countDocuments()
      ]);

      // Get monthly counts
      const [
        organisersThisMonth,
        teamManagersThisMonth,
        tournamentsThisMonth,
        auctionsThisMonth
      ] = await Promise.all([
        User.countDocuments({ 
          role: ROLES.ORGANISER, 
          isActive: true,
          createdAt: { $gte: firstDayOfMonth }
        }),
        User.countDocuments({ 
          role: ROLES.TEAM_MANAGER, 
          isActive: true,
          createdAt: { $gte: firstDayOfMonth }
        }),
        Tournament.countDocuments({ 
          createdAt: { $gte: firstDayOfMonth }
        }),
        Auction.countDocuments({ 
          createdAt: { $gte: firstDayOfMonth }
        })
      ]);

      // Get last month counts for comparison
      const [
        organisersLastMonth,
        teamManagersLastMonth,
        tournamentsLastMonth,
        auctionsLastMonth
      ] = await Promise.all([
        User.countDocuments({ 
          role: ROLES.ORGANISER, 
          isActive: true,
          createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        }),
        User.countDocuments({ 
          role: ROLES.TEAM_MANAGER, 
          isActive: true,
          createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        }),
        Tournament.countDocuments({ 
          createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        }),
        Auction.countDocuments({ 
          createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        })
      ]);

      return {
        totalOrganisers: {
          total: totalOrganisers,
          thisMonth: organisersThisMonth,
          lastMonth: organisersLastMonth,
          growth: organisersThisMonth - organisersLastMonth
        },
        totalTeamManagers: {
          total: totalTeamManagers,
          thisMonth: teamManagersThisMonth,
          lastMonth: teamManagersLastMonth,
          growth: teamManagersThisMonth - teamManagersLastMonth
        },
        totalTournaments: {
          total: totalTournaments,
          thisMonth: tournamentsThisMonth,
          lastMonth: tournamentsLastMonth,
          growth: tournamentsThisMonth - tournamentsLastMonth
        },
        totalAuctions: {
          total: totalAuctions,
          thisMonth: auctionsThisMonth,
          lastMonth: auctionsLastMonth,
          growth: auctionsThisMonth - auctionsLastMonth
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Get recent activity for dashboard
   * @param {number} limit - Number of recent items to fetch
   * @returns {Promise<Object>} Recent activity data
   */
  async getRecentActivity(limit = 10) {
    try {
      const [
        recentTournaments,
        recentAuctions,
        recentOrganisers,
        recentTeamManagers
      ] = await Promise.all([
        Tournament.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('name createdAt status')
          .populate('createdBy', 'fullName'),
        Auction.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('auctionDate status')
          .populate('tournament', 'name'),
        User.find({ role: ROLES.ORGANISER, isActive: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('fullName createdAt isVerified'),
        User.find({ role: ROLES.TEAM_MANAGER, isActive: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('fullName createdAt isVerified')
      ]);

      return {
        recentTournaments,
        recentAuctions,
        recentOrganisers,
        recentTeamManagers
      };
    } catch (error) {
      throw new Error(`Failed to get recent activity: ${error.message}`);
    }
  }
}

module.exports = new DashboardService(); 