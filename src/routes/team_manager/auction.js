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

/**
 * @swagger
 * /organiser/auction/{auctionId}/gallery:
 *   get:
 *     summary: Get gallery
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Gallery retrieved
 */
router.get("/:auctionId/gallery", auctionController.getGallery);

router.post('/:auctionId/place-concealed-bid', auctionController.placeConcealedBid);

module.exports = router;