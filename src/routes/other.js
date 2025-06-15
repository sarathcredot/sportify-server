const express = require("express");
const CityController = require("../controllers/cityController");
const router = express.Router();
const cityController = new CityController();
const socketService = require("../services/socketService");



/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Get all cities
 *     tags: [Cities]
 *     responses:
 *       200:
 *         description: List of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/City'
 */
router.get("/cities", cityController.getCities);

router.get("/test-socket", (req, res) => {
  //   const socketService = new SocketService();
    socketService.sendMessageToAllTeamManagersInTournament("684802528d155d26cac7c54a", "concealed-bid-requested", {
      message: "Concealed bid requested",
      auctionId: "684802528d155d26cac7c54a",
      playerId: "684802528d155d26cac7c54a",
      playerName: "John Doe",
    });
//   socketService.sendMessageToUser('6800e70e5c037f229823c181', "Hi test Message");
  res.send("Socket message sent");
});

module.exports = router;
