


const express = require('express');
const router = express.Router();
const downloadControler = require("../../controllers/downloadController")



router.get("/:tournamentId/tournament-players", downloadControler.downloadTournamentPlayers)




module.exports = router
