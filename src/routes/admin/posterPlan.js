const express = require('express');
const validate = require('../../utils/validate');
const PosterPlanController = require('../../controllers/posterPlanController');
const { createPosterPlanSchema } = require('../../schemas/posterPlanSchema');

const router = express.Router();

const posterPlanController = new PosterPlanController();

router.post(
  "/",
  validate(createPosterPlanSchema),
  posterPlanController.createPosterPlan
);

router.get("/", posterPlanController.getPosterPlans);
router.get("/:posterPlanId", posterPlanController.getPosterPlanById);
router.patch("/:posterPlanId", posterPlanController.updatePosterPlan);
router.delete("/:posterPlanId", posterPlanController.deletePosterPlan);

module.exports = router;
