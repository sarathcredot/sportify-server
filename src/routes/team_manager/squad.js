
const express = require('express');
const router = express.Router();
const SquadController = require("../../controllers/squadController")
const validate = require('../../utils/validate');
const { createSquadSchema, editSquadSchema } = require("../../schemas/squadSchema")

const squadController = new SquadController();

router.get("/", squadController.getSquadsOfTeamManager)
router.post("/", validate(createSquadSchema), squadController.createSquad) 
router.put("/:squadId", validate(editSquadSchema), squadController.updateSquad)
router.delete("/:squadId", squadController.deleteSquad)

module.exports = router;