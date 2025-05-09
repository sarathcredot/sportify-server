const express = require("express");
const CityController = require("../controllers/cityController");
const router = express.Router();
const cityController = new CityController();

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Get all cities
 *     tags: [Cities]
 *     responses:
 *       200:
 *         description: List of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/City'
 */
router.get("/cities", cityController.getCities);

module.exports = router;
