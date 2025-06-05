


const express = require('express');
const router = express.Router();
const downloadControler = require("../../controllers/downloadController")



router.get("/:tournamentId/tournament-players", downloadControler.downloadTournamentPlayers)
router.get("/:tournamentId/tournament-teams", downloadControler.downloadTournamentTeam)




module.exports = router
