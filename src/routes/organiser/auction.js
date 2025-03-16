const express = require('express');
const router = express.Router();

// GET all auctions
router.get('/', (req, res) => {
  res.send('List all auctions');
});

module.exports = router;