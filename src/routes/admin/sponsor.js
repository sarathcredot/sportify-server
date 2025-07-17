

const express = require('express');

const router = express.Router();
const SponsorController=require("../../controllers/sponsorController")

const sponsorController=new SponsorController()




router.get("/:id",sponsorController.getSponsorsById)
router.put("/:id",sponsorController.updateSponsor)
router.delete("/:id",sponsorController.deleteSponsor)









module.exports=router