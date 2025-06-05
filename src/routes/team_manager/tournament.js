const express = require('express');
const TournamentController = require('../../controllers/tournamentController');
const TeamController = require('../../controllers/teamController');
const validate = require('../../utils/validate');
const { registerTeamSchema } = require('../../schemas/teamSchema');

const router = express.Router();
const tournamentController = new TournamentController();
const teamController = new TeamController();

/**
 * @swagger
 * /team-manager/tournaments:
 *   get:
 *     summary: Get all tournaments for the team manager
 *     tags: [Team Manager]
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
router.get('/', tournamentController.getTeamManagerTournaments);

/**
 * @swagger
 * /team-manager/tournaments/{id}:
 *   get:
 *     summary: Get a tournament by ID
 *     tags: [Team Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the tournament
 *     responses:
 *       200:
 *         description: Tournament details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', tournamentController.getTournamentById);

/**
 * @swagger
 * /team-manager/tournaments/{tournamentId}/teams:
 *   post:
 *     summary: Register a new player for a tournament
 *     tags: [Team Manager]
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
    '/:tournamentId/teams',
    validate(registerTeamSchema),
    teamController.registerTeam
);

module.exports = router;