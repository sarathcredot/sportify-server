const express = require('express');
const AuctionController = require('../../controllers/auctionController');
const router = express.Router();
const auctionController = new AuctionController();

/**
 * @swagger
 * /team-manager/auctions:
 *   get:
 *     summary: Get all auctions for the team manager
 *     tags: [Team Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of auctions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', auctionController.getTeamManagerAuctions);

module.exports = router;