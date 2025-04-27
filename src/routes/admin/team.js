const express = require('express');
const validate = require('../../utils/validate'); 
const { updateUserSchema } = require('../../schemas/authSchema'); 
const OrganiserController = require('../../controllers/organiserController');

const router = express.Router();
const organiserController = new OrganiserController();

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

module.exports = router;