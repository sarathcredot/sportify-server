const express = require('express');
const validate = require('../../utils/validate'); 
// const { createClipboardSchema } = require('../../schemas/clipboardSchema'); 
const ClipboardController = require('../../controllers/clipboardController');

const router = express.Router();
const clipboardController = new ClipboardController();

/**
 * @swagger
 * /admin/clipboards:
 *   post:
 *     summary: Create clip board
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClipboard'
 *     responses:
 *       200:
 *         description: Clip board created successfully
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
router.post('/', 
  // validate(createClipboardSchema),
   clipboardController.createClipboard);

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
  clipboardController.getAllClipboards
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
  clipboardController.deleteClipboardById
);

/**
 * @swagger
 * /admin/clipboards/delete/many:
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
router.post(
  '/delete/many',
  clipboardController.deleteClipBoardByIds
);

module.exports = router;