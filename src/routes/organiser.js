const express = require('express');
const auth = require('../middleware/auth');
const checkIsOrganiser = require('../middleware/checkIsOrganiser');
const router = express.Router();
const tournamentsRouter = require('./tournaments');


router.use(auth);
router.use(checkIsOrganiser);

router.use('/tournaments', tournamentsRouter);

module.exports = router;
