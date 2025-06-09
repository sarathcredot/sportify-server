const express = require("express");
const validate = require("../../utils/validate");
const AuctionPlanController = require("../../controllers/auctionPlanController");
const { createAuctionPlanSchema } = require("../../schemas/auctionPlanSchema");

const router = express.Router();

const auctionPlanController = new AuctionPlanController();

router.post(
  "/",
  validate(createAuctionPlanSchema),
  auctionPlanController.createAuctionPlan
);

router.get("/", auctionPlanController.getAuctionPlans);
router.get("/:auctionPlanId", auctionPlanController.getAuctionPlanById);
router.patch("/:auctionPlanId", auctionPlanController.updateAuctionPlan);
router.delete("/:auctionPlanId", auctionPlanController.deleteAuctionPlan);

module.exports = router;
