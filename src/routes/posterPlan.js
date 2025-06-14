const express = require('express');
const PosterPlanController = require('../controllers/posterPlanController');

const router = express.Router();

const posterPlanController = new PosterPlanController();

router.get("/", posterPlanController.getPosterPlans);

module.exports = router;
