const express = require('express');
const TournamentController = require('../../controllers/tournamentController');
const validate = require('../../utils/validate'); 
const { createTournamentSchema } = require('../../schemas/tournamentSchema');
const checkOwnership = require('../../middleware/checkOwnership');
const Tournament = require('../../models/Tournament');
const { createPlayerSchema, approvePlayerSchema, refundPlayerSchema } = require('../../schemas/playerSchema');
const PlayerController = require('../../controllers/playerController');
const TeamController = require('../../controllers/teamController');
const { createTeamSchema, approveTeamSchema, refundTeamSchema } = require('../../schemas/teamSchema');

const router = express.Router();
const tournamentController = new TournamentController();
const playerController = new PlayerController();
const teamController = new TeamController();

/**
 * @swagger
 * /organiser/tournaments:
 *   get:
 *     summary: Get all tournaments for the organiser
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', tournamentController.getOrganiserTournaments);

/**
 * @swagger
 * /organiser/tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTournament'
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       type: integer
 *                       example: 401
 */
router.post('/', validate(createTournamentSchema), tournamentController.createTournament);

/**
 * @swagger
 * /organiser/tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament details
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.getTournamentById
);

/**
 * @swagger
 * /organiser/tournaments/{id}:
 *   delete:
 *     summary: Delete tournament by ID
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.deleteTournamentById
);

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/players:
 *   post:
 *     summary: Create a new player for a tournament
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlayer'
 *     responses:
 *       201:
 *         description: Player registered successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:tournamentId/players',
  validate(createPlayerSchema),
  playerController.createPlayer
);

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/players:
 *   get:
 *     summary: Get players by tournament ID
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Player status
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of players
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Player'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:tournamentId/players',
  playerController.getPlayersByTournamentId
);

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/players/{playerId}/approve:
 *   post:
 *     summary: Approve a player
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Player not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:tournamentId/players/:playerId/approve',
  validate(approvePlayerSchema),
  playerController.approvePlayer
);

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/players/{playerId}/refund:
 *   post:
 *     summary: Refund a player
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           parameters:
 *             - in: body
 *               name: refund
 *               type: integer
 *               description: Refund amount
 *     responses:
 *       200:
 *         description: Player refunded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Player not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:tournamentId/players/:playerId/refund',
  validate(refundPlayerSchema),
  playerController.refundPlayer
);

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/teams:
 *   post:
 *     summary: Create a new team for a tournament
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeam'
 *     responses:
 *       201:
 *         description: Team registered successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 */
router.post(
  '/:tournamentId/teams',
  validate(createTeamSchema),
  teamController.createTeam
); 

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/teams:
 *   get:
 *     summary: Get teams by tournament ID
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Team status
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of teams
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 */
router.get(
  '/:tournamentId/teams',
  teamController.getTeamsByTournamentId
);

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/teams/{teamId}/approve:
 *   post:
 *     summary: Approve a team
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team approved successfully
 */
router.post(
  '/:tournamentId/teams/:teamId/approve',
  validate(approveTeamSchema),
  teamController.approveTeam
);

/**
 * @swagger
 * /organiser/tournaments/{tournamentId}/teams/{teamId}/refund:
 *   post:
 *     summary: Refund a team
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           parameters:
 *             - in: body
 *               name: refund
 *               type: integer
 *               description: Refund amount
 *     responses:
 *       200:
 *         description: Team refunded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
// router.post(
//   '/:tournamentId/teams/:teamId/refund',
//   validate(refundTeamSchema),
//   teamController.refundTeam
// );

module.exports = router;