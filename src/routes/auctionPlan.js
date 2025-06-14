const express = require("express");
const AuctionPlanController = require("../controllers/auctionPlanController");

const router = express.Router();

const auctionPlanController = new AuctionPlanController();

router.get("/", auctionPlanController.getAuctionPlans);

module.exports = router;
