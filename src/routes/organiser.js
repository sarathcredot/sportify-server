const express = require('express');
const auth = require('../middleware/auth');
const checkIsOrganiser = require('../middleware/checkIsOrganiser');
const router = express.Router();
const tournamentsRouter = require('./organiser/tournament');
const TeamManagerController = require('../controllers/teamManagerController');

const teamManagerController = new TeamManagerController();

router.use(auth);
router.use(checkIsOrganiser());

/**
 * @swagger
 * tags:
 *   name: Organiser
 *   description: Organiser endpoints
 *   security:
 *     - bearerAuth: []
 *   components:
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */

router.use('/tournaments', tournamentsRouter);

/**
 * @swagger
 * /organiser/team-managers:
 *   get:
 *     summary: Get all team managers
 *     description: Get all team managers
 *     tags:
 *       - Organiser
 *     responses:
 *       200:
 *         description: Team managers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   fullName:
 *                     type: string
 */
router.get('/team-managers', teamManagerController.getAllTeamManagers);

module.exports = router;