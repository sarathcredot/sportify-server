const express = require('express');
const auth = require('../middleware/auth');
const checkIsTeamManager = require('../middleware/checkIsTeamManager');
const router = express.Router();
const tournamentsRouter = require('./team_manager/tournament');
const auctionsRouter = require('./team_manager/auction');
const notificationsRouter = require('./team_manager/notification');
const clipboardsRouter = require('./team_manager/clipboard');
const playersRouter = require('./team_manager/players');
const squadsRouter = require('./team_manager/squad');
const { updateUserProfile } = require('../controllers/authController');
const { updateUserProfileSchema } = require('../schemas/authSchema');
const validate = require('../utils/validate');

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

router.put('/profile', validate(updateUserProfileSchema), updateUserProfile);

router.use('/tournaments', tournamentsRouter);
router.use('/auctions', auctionsRouter);
router.use('/notifications', notificationsRouter);
router.use('/clipboards', clipboardsRouter);
router.use('/players', playersRouter);
router.use('/squads', squadsRouter);

module.exports = router;