const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/auth').default;
const tournamentController = require('../controllers/tournamentController');

const router = express.Router(authMiddleware);

// Create a new tournament
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Date must be a valid date')
  ],
  tournamentController.createTournament
);

// Get a tournament by ID
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('ID is required').isMongoId().withMessage('ID must be a valid MongoDB ID')
  ],
  tournamentController.getTournamentById
);

// Update a tournament by ID
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('ID is required').isMongoId().withMessage('ID must be a valid MongoDB ID'),
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('location').optional().notEmpty().withMessage('Location is required'),
    body('date').optional().notEmpty().withMessage('Date is required').isISO8601().withMessage('Date must be a valid date')
  ],
  tournamentController.updateTournamentById
);

// Delete a tournament by ID
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('ID is required').isMongoId().withMessage('ID must be a valid MongoDB ID')
  ],
  tournamentController.deleteTournamentById
);

module.exports = router;