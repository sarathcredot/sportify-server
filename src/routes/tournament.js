const express = require('express');
const multer = require("multer");
const auth = require('../middleware/auth');
const tournamentController = require('../controllers/tournamentController');
const validate = require('../utils/validate'); 
const { createTournamentSchema, updateTournamentSchema } = require('../schemas/tournamentSchema');
const checkOwnership = require('../middleware/checkOwnership');
const Tournament = require('../models/Tournament');

const upload = multer();
const router = express.Router();
router.use(auth);

// Create a new tournament
router.post(
  '/',
  validate(createTournamentSchema),
  tournamentController.createTournament
);

// Get a tournament by ID
router.get(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.getTournamentById
);

// Update a tournament by ID
router.put(
  '/:id',
  validate(updateTournamentSchema),
  checkOwnership(Tournament),
  tournamentController.updateTournamentById
);

// Delete a tournament by ID
router.delete(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.deleteTournamentById
);

module.exports = router;