const express = require("express");
const tournamentController = require("../controllers/tournamentController");
const playerController = require("../controllers/playerController");
const teamController = require("../controllers/teamController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Tournament:
 *       type: object
 *       properties:
 *         $ref: '../models/Tournament.js'
 */

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: List of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 */
router.get("/", tournamentController.getOrganiserTournaments);

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Tournaments]
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
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Tournament not found
 */
router.get("/:id", tournamentController.getTournamentById);

/**
 * @swagger
 * /tournaments/{tournamentId}/players:
 *   get:
 *     summary: Get players in a tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: List of players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *       404:
 *         description: Tournament not found
 */
router.get("/:tournamentId/players", playerController.getPlayersByTournamentId);

/**
 * @swagger
 * /tournaments/{tournamentId}/teams:
 *   get:
 *     summary: Get teams in a tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: List of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       404:
 *         description: Tournament not found
 */
router.get("/:tournamentId/teams", teamController.getTeamsByTournamentId);

module.exports = router;
