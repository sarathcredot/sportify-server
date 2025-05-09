const express = require("express");
const PlayerController = require("../controllers/playerController");
const TeamController = require("../controllers/teamController");
const TournamentController = require("../controllers/tournamentController");
const SponsorController = require("../controllers/sponsorController");
const { createPlayerSchema } = require("../schemas/playerSchema");
const validate = require("../utils/validate");

const router = express.Router();
const tournamentController = new TournamentController();
const playerController = new PlayerController();
const teamController = new TeamController();
const sponsorController = new SponsorController();

/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: Tournament endpoints
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
router.get("/", tournamentController.getTournaments);

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

/**
 * @swagger
 * /tournaments/:tournamentId/sponsors:
 *   get:
 *     summary: Get sponsors of a tournament
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
 *         description: List of sponsors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sponsor'
 *       404:
 *         description: Tournament not found
 */
router.get("/:tournamentId/sponsors", sponsorController.getSponsorsByTournamentId);

/**
 * @swagger
 * /tournaments/{tournamentId}/players:
 *   post:
 *     summary: Register a new player for a tournament
 *     tags: [Tournaments]
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
    playerController.registerPlayer
);



module.exports = router;
