const express = require('express');
const auth = require('../middleware/auth');
const checkIsOrganiser = require('../middleware/checkIsOrganiser');
const router = express.Router();
const tournamentsRouter = require('./organiser/tournament');
const auctionRouter = require('./organiser/auction');
const TeamManagerController = require('../controllers/teamManagerController');
const TemplateController = require('../controllers/templateController');

const teamManagerController = new TeamManagerController();
const templateController = new TemplateController();

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

router.use('/auction', auctionRouter);

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

/**
 * @swagger
 * /organiser/templates:
 *   get:
 *     summary: Get all clip boards
 *     tags: [Organiser]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: Type of clip board (logo or banner)
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Category of clip board (team or tournament)
 *     responses:
 *       200:
 *         description: Clip boards
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Clipboard'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Clip board not found
 *       500:
 *         description: Internal server error
 */
router.get('/templates/', templateController.getAllTemplates);

/**
 * @swagger
 * /organiser/template/{id}/download:
 *   get:
 *     summary: Download template as PNG image
 *     tags: [Organiser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template image downloaded successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
router.post('/template/:id/download', templateController.generateImageFromTemplate);

module.exports = router;