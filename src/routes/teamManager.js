const express = require('express');
const auth = require('../middleware/auth');
const checkIsTeamManager = require('../middleware/checkIsTeamManager');
const router = express.Router();
const tournamentsRouter = require('./team_manager/tournament');
const auctionsRouter = require('./team_manager/auction');
const notificationsRouter = require('./team_manager/notification');
const clipboardsRouter = require('./team_manager/clipboard');
const playersRouter = require('./team_manager/players');


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
router.use('/auctions', auctionsRouter);
router.use('/notifications', notificationsRouter);
router.use('/clipboards', clipboardsRouter);
router.use('/players', playersRouter);

module.exports = router;