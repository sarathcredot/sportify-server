
const express = require('express');
const router = express.Router();
const PlayerController = require("../../controllers/playerController")
const validate = require('../../utils/validate');
const { createTeamManagerPlayerSchema, editTeamManagerPlayerSchema } = require("../../schemas/teamManagerPlayerSchema")

const playerController = new PlayerController();

router.get("/", playerController.getPlayersOfTeamManager)
router.post("/", validate(createTeamManagerPlayerSchema), playerController.createPlayerOfTeamManager) 
router.put("/:playerId", validate(editTeamManagerPlayerSchema), playerController.editPlayerOfTeamManager)
router.delete("/:playerId", playerController.removePlayerOfTeamManager)

module.exports = router;