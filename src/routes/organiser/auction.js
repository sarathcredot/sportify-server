const express = require('express');
const router = express.Router();
const AuctionController = require('../../controllers/auctionController');
const validate = require('../../utils/validate');
const { placeBidSchema } = require('../../schemas/auctionSchema');

const auctionController = new AuctionController();

/**
 * @swagger
 * /organiser/auction/{auctionId}/:
 *   get:
 *     summary: Get auction details
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
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     auction:
 *                       $ref: '#/components/schemas/Auction'
 *         description: Auction details
 */
router.get('/:auctionId/', (req, res) => {
  auctionController.getAuction(req, res);
})

/**
 * @swagger
 * /organiser/auction/{auctionId}/players:
 *   get:
 *     summary: Get all players for the auction
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *         description: List of players
 */
router.get('/:auctionId/players', (req, res) => {
  auctionController.getPlayers(req, res);
});

/**
 * @swagger
 * /organiser/auction/{auctionId}/teams:
 *   get:
 *     summary: Get all teams for the auction
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *         description: List of teams
 */
router.get('/:auctionId/teams', (req, res) => {
  auctionController.getTeams(req, res);
});

router.get('/:tournamentId/teams-live-preview', (req, res) => {
  auctionController.getTeamsLivePreview(req, res);

});

/**
 * @swagger
 * /organiser/auction/{auctionId}/start:
 *   post:
 *     summary: Start the auction
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
 * /organiser/auction/{auctionId}/generate-random-player:
 *   post:
 *     summary: Generate a random player
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
 *         description: Random player generated
 */
router.get('/:auctionId/generate-random-player', (req, res) => {
  auctionController.generateRandomPlayer(req, res);
});

/**
 * @swagger
 * /organiser/auction/{auctionId}/end:
 *   post:
 *     summary: End the auction
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
 *         description: Auction ended
 */
router.post('/:auctionId/end', (req, res) => {
  auctionController.endAuction(req, res);
});

/**
 * @swagger
 * /organiser/auction/{auctionId}/place-bid:
 *   post:
 *     summary: Place a bid
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
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
router.post("/:auctionId/place-bid", validate(placeBidSchema), auctionController.placeBid);


/**
 * @swagger
 * /organiser/auction/{auctionId}/delete-bid:
 *   delete:
 *     summary: Delete a bid
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bidId:
 *                 type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Bid deleted
 */
router.delete("/:auctionId/delete-bid/:bidId", auctionController.deleteBid);

/**
 * @swagger
 * /organiser/auction/{auctionId}/request-concealed-bid:
 *   post:
 *     summary: Request a concealed bid
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Concealed bid requested
 */
router.post("/:auctionId/request-concealed-bid", auctionController.requestConcealedBid);

/**
 * @swagger
 * /organiser/auction/{auctionId}/mark-player-sold:
 *   post:
 *     summary: Mark a player as sold
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
 *         description: Player marked as sold
 */
router.post("/:auctionId/mark-player-sold", auctionController.markPlayerSold);

/**
 * @swagger
 * /organiser/auction/{auctionId}/mark-player-unsold:
 *   post:
 *     summary: Mark a player as unsold
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
 *         description: Player marked as unsold
 */
router.post("/:auctionId/mark-player-unsold", auctionController.markPlayerUnsold);

/**
 * @swagger
 * /organiser/auction/{auctionId}/revert-mark-player-sold/{playerId}:
 *   post:
 *     summary: Revert a player as sold
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: The ID of the player
 *     responses:
 *       200: 
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Player reverted as sold
 */
router.post("/:auctionId/revert-mark-player-sold/:playerId", auctionController.revertMarkPlayerSold);

/**
 * @swagger
 * /organiser/auction/{auctionId}/revert-mark-player-unsold/{playerId}:
 *   post:
 *     summary: Revert a player as unsold
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: The ID of the player
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object 
 *         description: Player reverted as unsold
 */
router.post("/:auctionId/revert-mark-player-unsold/:playerId", auctionController.revertMarkPlayerUnsold);

/**
 * @swagger
 * /organiser/auction/{auctionId}/bid-history:
 *   get:
 *     summary: Get bid history
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *       - name: player
 *         in: query
 *         required: false
 *         description: The ID of the player
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
 *                       type: array
 *                       items:
 *                         type: object
 *                         allOf:
 *                           - $ref: '#/components/schemas/Bid'
 *                           - type: object
 *                             properties:
 *                               placedBy:
 *                                 $ref: '#/components/schemas/TournamentTeams'
 *         description: Bid history
 */
router.get("/:auctionId/bid-history", auctionController.getBidHistory);

/**
 * @swagger
 * /organiser/auction/{auctionId}/request-concealed-bid:
 *   get:
 *     summary: Get concealed bids
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
 *         description: Concealed bid request
 */
router.get("/:auctionId/request-concealed-bid", auctionController.getRequestConcealedBid);

/**
 * @swagger
 * /organiser/auction/{auctionId}/concealed-bids/:
 *   get:
 *     summary: Get concealed bids
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
 *         description: Concealed bids retrieved
 */
router.get("/:auctionId/concealed-bids", auctionController.getConcealedBids);

/**
 * @swagger
 * /organiser/auction/{auctionId}/place-concealed-bid:
 *   post:
 *     summary: Place a concealed bid
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
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
 *         description: Concealed bid placed
 */
router.post("/:auctionId/place-concealed-bid", validate(placeBidSchema), auctionController.placeConcealedBid);

/**
 * @swagger
 * /organiser/auction/{auctionId}/mark-player-sold-for-concealed-bid:
 *   post:
 *     summary: Mark a player as sold for a concealed bid
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
 *         description: Player marked as sold for a concealed bid
 */
router.post("/:auctionId/mark-player-sold-for-concealed-bid", auctionController.markPlayerSoldForConcealedBid);

/**
 * @swagger
 * /organiser/auction/{auctionId}/cancel-concealed-bid:
 *   post:
 *     summary: Cancel a concealed bid
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
 *         description: Concealed bid cancelled
 */
router.post("/:auctionId/cancel-concealed-bid", auctionController.cancelConcealedBidRequest);

/**
 * @swagger
 * /organiser/auction/{auctionId}/signed-players:
 *   get:
 *     summary: Get signed players
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *       - name: teamId
 *         in: query
 *         required: false
 *         description: The ID of the team
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Signed players retrieved
 */
router.get("/:auctionId/signed-players", auctionController.getSignedPlayers);

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

/**
 * @swagger
 * /organiser/auction/{auctionId}/gallery:
 *   post:
 *     summary: Add a gallery asset
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetUrl:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Gallery asset added
 */
router.post("/:auctionId/gallery", auctionController.addGalleryAsset);

/**
 * @swagger
 * /organiser/auction/{auctionId}/gallery/{assetId}:
 *   delete:
 *     summary: Delete a gallery asset
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: auctionId
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *       - name: assetId
 *         in: path
 *         required: true
 *         description: The ID of the asset
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *         description: Gallery asset deleted
 */
router.delete("/:auctionId/gallery/:assetId", auctionController.deleteGalleryAsset);

/**
 * @swagger
 * /organiser/auction/{auctionId}/gallery/play:
 *   post:
 *     summary: Play a gallery
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
 *         description: Gallery played
 */
router.post("/:auctionId/gallery/play", auctionController.playGallery);

module.exports = router;  