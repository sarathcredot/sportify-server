const express = require('express');
const TournamentController = require('../../controllers/tournamentController');

const router = express.Router();
const tournamentController = new TournamentController();

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

module.exports = router;