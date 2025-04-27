const express = require('express');
const validate = require('../../utils/validate'); 
const { updateTeamSchema } = require('../../schemas/teamSchema'); 
const TeamController = require('../../controllers/teamController');

const router = express.Router();
const teamController = new TeamController();

/**
 * @swagger
 * /admin/teams/{id}:
 *   patch:
 *     summary: Update team by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Team updated successfully
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
router.patch('/:id', validate(updateTeamSchema), teamController.updateTeamById);

/**
 * @swagger
 * /admin/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team details
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  teamController.getTeamById
);

/**
 * @swagger
 * /admin/teams/{id}:
 *   delete:
 *     summary: Delete team by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  teamController.deleteTeamById
);

module.exports = router;