


const express = require('express');
const validate = require('../../utils/validate'); 

const router = express.Router();
const PlayerController =require("../../controllers/playerController")

const playerController=new PlayerController()

router.get("/:id",playerController.getPlayerById)
router.put("/:id",playerController.editPlayerOfAdmin)
router.delete("/:id",playerController.deletePlayer)









module.exports=router