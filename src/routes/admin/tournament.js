const express = require('express');
const TournamentController = require('../../controllers/tournamentController');
const validate = require('../../utils/validate'); 
const { createTournamentSchema, updateTournamentSchema } = require('../../schemas/tournamentSchema');
const checkOwnership = require('../../middleware/checkOwnership');
const Tournament = require('../../models/Tournament');

const router = express.Router();
const tournamentController = new TournamentController();
/**
 * @swagger
 * /admin/tournaments:
 *   get:
 *     summary: Get all tournaments for the admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', tournamentController.getTournaments);

/**
 * @swagger
 * /admin/tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTournament'
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       type: integer
 *                       example: 401
 */
router.post('/', validate(createTournamentSchema), tournamentController.createTournament);

/**
 * @swagger
 * /admin/tournaments/{id}:
 *   patch:
 *     summary: Update tournament by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTournament'
 *     responses:
 *       200:
 *         description: Tournament updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf: 
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tournament'
 *       401:   
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id', validate(updateTournamentSchema), tournamentController.updateTournamentById);

/**
 * @swagger
 * /admin/tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament details
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.getTournamentById
);

/**
 * @swagger
 * /admin/tournaments/{id}:
 *   delete:
 *     summary: Delete tournament by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.deleteTournamentById
);

module.exports = router;