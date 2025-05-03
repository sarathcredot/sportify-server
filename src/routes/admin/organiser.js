const express = require('express');
const validate = require('../../utils/validate'); 
const { updateUserSchema } = require('../../schemas/authSchema'); 
const OrganiserController = require('../../controllers/organiserController');

const router = express.Router();
const organiserController = new OrganiserController();

/**
 * @swagger
 * /admin/organisers:
 *   get:
 *     summary: Get all organisers for the admin
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
router.get('/', organiserController.getAllOrganisersPaginated);

/**
 * @swagger
 * /admin/organisers/{id}:
 *   patch:
 *     summary: Update organiser by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organiser ID 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
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
router.patch('/:id', validate(updateUserSchema), organiserController.updateOrganiserById);

/**
 * @swagger
 * /admin/organisers/{id}:
 *   get:
 *     summary: Get organiser by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organiser ID
 *     responses:
 *       200:
 *         description: Organiser details
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
  organiserController.getOrganiserById
);

/**
 * @swagger
 * /admin/organisers/{id}/tournaments:
 *   get:
 *     summary: Get all tournaments for an organiser
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organiser ID
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
 *                         type: object
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
  '/:id/tournaments',
  organiserController.getTournamentsByOrganiserId
);

/**
 * @swagger
 * /admin/organisers/{id}:
 *   delete:
 *     summary: Delete organiser by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organiser ID
 *     responses:
 *       200:
 *         description: Organiser deleted successfully
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
  organiserController.deleteOrganiserById
);

/**
 * @swagger
 * /admin/organisers/{id}/toggle-status:
 *   post:
 *     summary: Toggle status of an organiser
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             isActive:
 *               type: boolean
 *     responses:
 *       200:
 *         description: Status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organiser not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/toggle-status',
  organiserController.toggleStatus
);

module.exports = router;