const express = require('express');
const auth = require('../middleware/auth');
const checkIsAdmin = require('../middleware/checkIsAdmin');
const router = express.Router();
const tournamentsRouter = require('./admin/tournament');
const teamsRouter = require('./admin/team');
const teamManagersRouter = require('./admin/teammanagers');
const organisersRouter = require('./admin/organiser');
const clipboardsRouter = require('./admin/clipboard');
const templatesRouter = require('./admin/template');
const auctionPlanRouter = require('./admin/auctionPlan');
const posterPlanRouter = require('./admin/posterPlan');
const orderRouter = require('./admin/order');


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
router.use('/teams', teamsRouter);
router.use('/teammanagers', teamManagersRouter);
router.use('/organisers', organisersRouter);
router.use('/clipboards', clipboardsRouter);
router.use('/templates', templatesRouter);
router.use('/poster-plans', posterPlanRouter);
router.use('/auction-plans', auctionPlanRouter);
router.use('/order', orderRouter);

module.exports = router;
