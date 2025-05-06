const express = require('express');
const auth = require('../middleware/auth');
const checkIsAdmin = require('../middleware/checkIsAdmin');
const router = express.Router();
const tournamentsRouter = require('./admin/tournament');
const teamManagersRouter = require('./admin/teammanagers');
const organisersRouter = require('./admin/organiser');
const clipboardsRouter = require('./admin/clipboard');


router.use(auth);
router.use(checkIsAdmin());

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin endpoints
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
router.use('/teammanagers', teamManagersRouter);
router.use('/organisers', organisersRouter);
router.use('/clipboards', clipboardsRouter);

module.exports = router;
