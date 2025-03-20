const express = require('express');
const auth = require('../middleware/auth');
const checkIsOrganiser = require('../middleware/checkIsOrganiser');
const router = express.Router();
const tournamentsRouter = require('./organiser/tournament');


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

module.exports = router;
