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
   * Get top organizers by tournament count
   * @param {number} limit - Number of top organizers to fetch
   * @returns {Promise<Array>} Top organizers with tournament counts
   */
  async getTopOrganizers(limit = 10) {
    try {
      const topOrganizers = await Tournament.aggregate([
        {
          $group: {
            _id: '$createdBy',
            tournamentCount: { $sum: 1 }
          }
        },
        {
          $sort: { tournamentCount: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'organizer'
          }
        },
        {
          $unwind: '$organizer'
        },
        {
          $project: {
            organizer: '$organizer.fullName',
            tournaments: '$tournamentCount'
          }
        }
      ]);

      return topOrganizers;
    } catch (error) {
      throw new Error(`Failed to get top organizers: ${error.message}`);
    }
  }

  /**
   * Get organizer statistics with time-based filtering and chart data
   * @param {string} filterType - 'day', 'week', 'month', 'year' (only affects chart data)
   * @param {number} year - Year for chart data
   * @returns {Promise<Object>} Organizer statistics with chart data
   */
  async getOrganizerStats(filterType = 'month', year = new Date().getFullYear()) {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      // Always get fixed monthly statistics
      const [
        totalOrganizers,
        thisMonthOrganizers,
        lastMonthOrganizers
      ] = await Promise.all([
        User.countDocuments({ role: ROLES.ORGANISER, isActive: true }),
        User.countDocuments({
          role: ROLES.ORGANISER,
          isActive: true,
          createdAt: { $gte: firstDayOfMonth }
        }),
        User.countDocuments({
          role: ROLES.ORGANISER,
          isActive: true,
          createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        })
      ]);

      // Get chart data based on filter type
      let chartData;
      switch (filterType) {
        case 'day':
          chartData = await this.getDailyOrganizerChart(currentDate);
          break;
        case 'week':
          chartData = await this.getWeeklyOrganizerChart(currentDate);
          break;
        case 'month':
          chartData = await this.getMonthlyOrganizerChart(year);
          break;
        case 'year':
          chartData = await this.getYearlyOrganizerChart();
          break;
        default:
          chartData = await this.getMonthlyOrganizerChart(year);
      }

      return {
        totalOrganizers,
        thisMonth: thisMonthOrganizers,
        lastMonth: lastMonthOrganizers,
        chartData
      };
    } catch (error) {
      throw new Error(`Failed to get organizer statistics: ${error.message}`);
    }
  }

  /**
   * Get monthly organizer chart data
   * @param {number} year - Year for chart data
   * @returns {Promise<Array>} Monthly organizer data
   */
  async getMonthlyOrganizerChart(year = new Date().getFullYear()) {
    try {
      const monthlyData = await User.aggregate([
        {
          $match: {
            role: ROLES.ORGANISER,
            isActive: true,
            createdAt: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(year + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      // Create array with all months (1-12) and fill with 0 for missing months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = monthNames.map((month, index) => {
        const monthData = monthlyData.find(item => item._id === index + 1);
        return {
          month,
          value: monthData ? monthData.count : 0
        };
      });

      return chartData;
    } catch (error) {
      throw new Error(`Failed to get monthly organizer chart data: ${error.message}`);
    }
  }

  /**
   * Get daily organizer chart data (days of the week)
   * @param {Date} currentDate - Current date
   * @returns {Promise<Array>} Daily organizer data
   */
  async getDailyOrganizerChart(currentDate) {
    try {
      const dayOfWeek = currentDate.getDay();
      const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), diff);
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

      const dailyData = await User.aggregate([
        {
          $match: {
            role: ROLES.ORGANISER,
            isActive: true,
            createdAt: { $gte: startOfWeek, $lt: endOfWeek }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = dayNames.map((day, index) => {
        const dayData = dailyData.find(item => item._id === index + 1);
        return {
          day,
          value: dayData ? dayData.count : 0
        };
      });

      return chartData;
    } catch (error) {
      throw new Error(`Failed to get daily organizer chart data: ${error.message}`);
    }
  }

  /**
   * Get weekly organizer chart data (weeks of the month)
   * @param {Date} currentDate - Current date
   * @returns {Promise<Array>} Weekly organizer data
   */
  async getWeeklyOrganizerChart(currentDate) {
    try {
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();

      const weeklyData = await User.aggregate([
        {
          $match: {
            role: ROLES.ORGANISER,
            isActive: true,
            createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
          }
        },
        {
          $addFields: {
            weekOfMonth: {
              $ceil: {
                $divide: [
                  { $add: [{ $dayOfMonth: '$createdAt' }, { $subtract: [{ $dayOfWeek: '$createdAt' }, 1] }] },
                  7
                ]
              }
            }
          }
        },
        {
          $group: {
            _id: '$weekOfMonth',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      // Create array with weeks 1-5 (some months have 5 weeks)
      const chartData = [];
      for (let week = 1; week <= 5; week++) {
        const weekData = weeklyData.find(item => item._id === week);
        chartData.push({
          week: `Week ${week}`,
          value: weekData ? weekData.count : 0
        });
      }

      return chartData;
    } catch (error) {
      throw new Error(`Failed to get weekly organizer chart data: ${error.message}`);
    }
  }

  /**
   * Get yearly organizer chart data
   * @returns {Promise<Array>} Yearly organizer data
   */
  async getYearlyOrganizerChart() {
    try {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4; // Show last 5 years

      const yearlyData = await User.aggregate([
        {
          $match: {
            role: ROLES.ORGANISER,
            isActive: true,
            createdAt: {
              $gte: new Date(startYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $year: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      const chartData = [];
      for (let year = startYear; year <= currentYear; year++) {
        const yearData = yearlyData.find(item => item._id === year);
        chartData.push({
          year: year.toString(),
          value: yearData ? yearData.count : 0
        });
      }

      return chartData;
    } catch (error) {
      throw new Error(`Failed to get yearly organizer chart data: ${error.message}`);
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