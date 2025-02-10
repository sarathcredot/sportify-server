const express = require('express');
const auth = require('../middleware/auth');
const tournamentController = require('../controllers/tournamentController');
const validate = require('../utils/validate'); 
const { createTournamentSchema } = require('../schemas/tournamentSchema');
const checkOwnership = require('../middleware/checkOwnership');
const Tournament = require('../models/Tournament');
const { createPlayerSchema } = require('../schemas/playerSchema');
const playerController = require('../controllers/playerController');


const router = express.Router();
router.use(auth);

router.get(
  '/',
  tournamentController.getOrganiserTournaments
);

router.post(
  '/',
  validate(createTournamentSchema),
  tournamentController.createTournament
);

router.get(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.getTournamentById
);

// router.put(
//   '/:id',
//   validate(updateTournamentSchema),
//   checkOwnership(Tournament),
//   tournamentController.updateTournamentById
// );

router.delete(
  '/:id',
  checkOwnership(Tournament),
  tournamentController.deleteTournamentById
);

router.post(
  '/:tournamentId/players',
  validate(createPlayerSchema),
  playerController.registerPlayer
);


module.exports = router;