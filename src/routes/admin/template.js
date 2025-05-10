const express = require('express');
const validate = require('../../utils/validate'); 
const { createTemplateSchema } = require('../../schemas/templateSchema');
const TemplateController = require('../../controllers/templateController');

const router = express.Router();

const templateController = new TemplateController();

/**
 * @swagger
 * /admin/templates:
 *   post:
 *     summary: Create template
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTemplate'
 *     responses:
 *       200:
 *         description: Template created successfully
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
 *                         url:
 *                           type: string
 *                         type:
 *                           type: string
 *                         category:
 *                           type: string
 *       401:   
 *         description: Unauthorized
 */
router.post('/', validate(createTemplateSchema), templateController.createTemplate);

/**
 * @swagger
 * /admin/clipboards:
 *   get:
 *     summary: Get all clip boards
 *     tags: [Admin]
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
router.get(
  '/',
  templateController.getAllTemplates
);

/**
 * @swagger
 * /admin/templates/{id}:
 *   patch:
 *     summary: Update template by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTemplate'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/:id',
  validate(createTemplateSchema),
  templateController.updateTemplateById
);

/**
 * @swagger
 * /admin/clipboards/{id}:
 *   delete:
 *     summary: Delete clip board by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clip board ID
 *     responses:
 *       200:
 *         description: Clip board deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Clip board not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  templateController.deleteTemplateById
);


/**
 * @swagger
 * /admin/clipboards/delete/many:
 *   post:
 *     summary: Delete clip board by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clip board ID
 *     responses:
 *       200:
 *         description: Clip board deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Clip board not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/delete/many',
  templateController.deleteTemplatesByIds
);

/**
 * @swagger
 * /admin/templates/{id}/download:
 *   get:
 *     summary: Download template as PNG image
 *     tags: [Admin]
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
router.post('/:id/download', templateController.generateImageFromTemplate);

module.exports = router;