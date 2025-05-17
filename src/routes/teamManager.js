const express = require('express');
const auth = require('../middleware/auth');
const checkIsTeamManager = require('../middleware/checkIsTeamManager');
const router = express.Router();
const tournamentsRouter = require('./team_manager/tournament');

router.use(auth);
router.use(checkIsTeamManager());

/**
 * @swagger
 * tags:
 *   name: Team Manager
 *   description: Team Manager endpoints
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

module.exports = router;