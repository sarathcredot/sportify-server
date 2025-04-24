const express = require('express');
const validate = require('../../utils/validate'); 
const { updateTeamManagerSchema } = require('../../schemas/teamManagerSchema'); 
const TeamManagerController = require('../../controllers/teamManagerController');

const router = express.Router();
const teamManagerController = new TeamManagerController();

/**
 * @swagger
 * /admin/teammanagers:
 *   get:
 *     summary: Get all team managers for the admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search query
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         description: Limit
 *     responses:
 *       200:
 *         description: List of team managers
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
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           isVerified:
 *                             type: boolean
 *                           isActive:
 *                             type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', teamManagerController.getAllTeamManagersPaginated);

/**
 * @swagger
 * /admin/teammanagers/{id}:
 *   patch:
 *     summary: Update team manager by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team manager ID 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeamManager'
 *     responses:
 *       200:
 *         description: Team manager updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf: 
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         isVerified:
 *                           type: boolean
 *                         isActive:
 *                           type: boolean
 *       401:   
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id', validate(updateTeamManagerSchema), teamManagerController.updateTeamManagerById);

/**
 * @swagger
 * /admin/teammanagers/{id}:
 *   get:
 *     summary: Get team manager by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team manager ID
 *     responses:
 *       200:
 *         description: Team manager details
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         isVerified:
 *                           type: boolean
 *                         isActive:
 *                           type: boolean
 *                         teams:
 *                           type: array
 *                           items:
 *                             type: object
 *                             $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team manager not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  teamManagerController.getTeamManagerById
);

/**
 * @swagger
 * /admin/teammanagers/{id}:
 *   delete:
 *     summary: Delete team manager by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team manager ID
 *     responses:
 *       200:
 *         description: Team manager deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team manager not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  teamManagerController.deleteTeamManagerById
);

module.exports = router;