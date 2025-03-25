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

/**
 * @swagger
 * /organiser/auction/start:
 *   post:
 *     summary: Start the auction
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         player:
 *                           $ref: '#/components/schemas/TournamentPlayers'
 *                            
 *         description: Auction started
 */
router.post('/:auctionId/start', (req, res) => {
  auctionController.startAuction(req, res);
});



/**
 * @swagger
 * /organiser/auction/place-bid:
 *   post:
 *     summary: Place a bid
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *               bidAmount:
 *                 type: number
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Bid placed
 */
router.post('/place-bid', (req, res) => {
  auctionController.placeBid(req, res);
});

module.exports = router;