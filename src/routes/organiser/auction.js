const express = require('express');
const router = express.Router();
const AuctionController = require('../../controllers/auctionController');


const auctionController = new AuctionController();

/**
 * @swagger
 * /organiser/auction/players:
 *   get:
 *     summary: Get all players for the auction
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *         description: List of players
 */
router.get('/players', (req, res) => {
  auctionController.getPlayers(req, res);
});

/**
 * @swagger
 * /organiser/auction/teams:
 *   get:
 *     summary: Get all teams for the auction
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *         description: List of teams
 */
router.get('/teams', (req, res) => {
  auctionController.getTeams(req, res);
});

module.exports = router;