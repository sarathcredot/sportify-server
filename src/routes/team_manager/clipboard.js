const express = require('express');
const ClipboardController = require('../../controllers/clipboardController');

const router = express.Router();
const clipboardController = new ClipboardController();


/**
 * @swagger
 * /team-manager/clipboards:
 *   get:
 *     summary: Get all clip boards
 *     tags: [Team Manager]
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
  clipboardController.getAllClipBoardsForUser
);

module.exports = router;