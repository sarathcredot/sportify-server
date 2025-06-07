

const express = require('express');
const router = express.Router();
const OrganiserController = require("../../controllers/organiserController")
const validate =require("../../utils/validate")
const {organiserProfileSchema}=require("../../schemas/organiserProfileSchema")

const organiserController = new OrganiserController()


router.get("/", organiserController.getOrganiserProfile)
router.patch("/",validate(organiserProfileSchema), organiserController.updateOrganiserProfile)



module.exports = router;

