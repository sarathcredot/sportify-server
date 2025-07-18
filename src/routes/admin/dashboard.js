const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboardController');

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve statistics for admin dashboard including total organizers, team managers, tournaments, and auctions with monthly growth
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Dashboard statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrganisers:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 148
 *                         thisMonth:
 *                           type: number
 *                           example: 121
 *                         lastMonth:
 *                           type: number
 *                           example: 27
 *                         growth:
 *                           type: number
 *                           example: 94
 *                     totalTeamManagers:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 148
 *                         thisMonth:
 *                           type: number
 *                           example: 34
 *                         lastMonth:
 *                           type: number
 *                           example: 0
 *                         growth:
 *                           type: number
 *                           example: 34
 *                     totalTournaments:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 148
 *                         thisMonth:
 *                           type: number
 *                           example: 34
 *                         lastMonth:
 *                           type: number
 *                           example: 0
 *                         growth:
 *                           type: number
 *                           example: 34
 *                     totalAuctions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 148
 *                         thisMonth:
 *                           type: number
 *                           example: 34
 *                         lastMonth:
 *                           type: number
 *                           example: 0
 *                         growth:
 *                           type: number
 *                           example: 34
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/stats', dashboardController.getDashboardStats);

/**
 * @swagger
 * /admin/dashboard/top-organizers:
 *   get:
 *     summary: Get top organizers by tournament count
 *     description: Retrieve top organizers ranked by the number of tournaments they have organized
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top organizers to fetch
 *     responses:
 *       200:
 *         description: Top organizers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Top organizers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       organizer:
 *                         type: string
 *                         example: "Rashid Khan"
 *                       tournaments:
 *                         type: number
 *                         example: 38
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/top-organizers', dashboardController.getTopOrganizers);

/**
 * @swagger
 * /admin/dashboard/organizer-stats:
 *   get:
 *     summary: Get organizer statistics with time-based filtering and chart data
 *     description: Retrieve organizer statistics with filtering options (day, week, month, year) and monthly chart data
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filterType
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period filter for statistics
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Year for chart data
 *     responses:
 *       200:
 *         description: Organizer statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Organizer statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrganizers:
 *                       type: number
 *                       example: 225
 *                     thisMonth:
 *                       type: number
 *                       example: 20
 *                     lastMonth:
 *                       type: number
 *                       example: 30
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "Jan"
 *                           value:
 *                             type: number
 *                             example: 121
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/organizer-stats', dashboardController.getOrganizerStats);

/**
 * @swagger
 * /admin/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity
 *     description: Retrieve recent activity data for admin dashboard
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent items to fetch
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Recent activity retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     recentTournaments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           createdBy:
 *                             type: object
 *                             properties:
 *                               fullName:
 *                                 type: string
 *                     recentAuctions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           auctionDate:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                           tournament:
 *                             type: object
 *                             properties:
 *                               name:
 *                             type: string
 *                     recentOrganisers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           isVerified:
 *                             type: boolean
 *                     recentTeamManagers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           isVerified:
 *                             type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/recent-activity', dashboardController.getRecentActivity);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get complete dashboard data
 *     description: Retrieve complete dashboard data including statistics and recent activity
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent items to fetch for activity
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Dashboard data retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 *                       description: Dashboard statistics
 *                     recentActivity:
 *                       type: object
 *                       description: Recent activity data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', dashboardController.getDashboardData);

/**
 * @swagger
 * /admin/dashboard/top-team-managers:
 *   get:
 *     summary: Get top team managers by tournament count
 *     description: Retrieve top team managers ranked by the number of tournaments they have participated in
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top team managers to fetch
 *     responses:
 *       200:
 *         description: Top team managers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Top team managers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       teamManager:
 *                         type: string
 *                         example: "Khalid Abdul"
 *                       tournaments:
 *                         type: number
 *                         example: 38
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/top-team-managers', dashboardController.getTopTeamManagers);

/**
 * @swagger
* /admin/dashboard/team-manager-stats:
 *   get:
 *     summary: Get team manager statistics with time-based filtering and chart data
 *     description: Retrieve team manager statistics with filtering options (day, week, month, year) and monthly chart data
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filterType
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period filter for chart data
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Year for chart data
 *     responses:
 *       200:
 *         description: Team manager statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Team manager statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTeamManagers:
 *                       type: number
 *                       example: 482
 *                     thisMonth:
 *                       type: number
 *                       example: 23
 *                     lastMonth:
 *                       type: number
 *                       example: 30
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "Jan"
 *                           value:
 *                             type: number
 *                             example: 121
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/team-manager-stats', dashboardController.getTeamManagerStats);

/**
 * @swagger
 * /admin/dashboard/top-tournaments:
 *   get:
 *     summary: Get top tournaments with organizer names
 *     description: Retrieve top tournaments with their organizer names
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top tournaments to fetch
 *     responses:
 *       200:
 *         description: Top tournaments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Top tournaments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tournament:
 *                         type: string
 *                         example: "Pepsi Indian Premier League"
 *                       organizer:
 *                         type: string
 *                         example: "John Doe"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/top-tournaments', dashboardController.getTopTournaments);

/**
 * @swagger
 * /admin/dashboard/tournament-stats:
 *   get:
 *     summary: Get tournament statistics with time-based filtering and chart data
 *     description: Retrieve tournament statistics with filtering options (day, week, month, year) and monthly chart data
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filterType
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period filter for chart data
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Year for chart data
 *     responses:
 *       200:
 *         description: Tournament statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Tournament statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTournaments:
 *                       type: number
 *                       example: 148
 *                     thisMonth:
 *                       type: number
 *                       example: 15
 *                     lastMonth:
 *                       example: 12
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "Jan"
 *                           value:
 *                             type: number
 *                             example: 25
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/tournament-stats', dashboardController.getTournamentStats);

module.exports = router; 