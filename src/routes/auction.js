const express = require('express');
const auth = require('../middleware/auth');
const auctionController = require('../controllers/auctionController');

const router = express.Router();
router.use(auth);

router.get(
  '/:id/auction',
  auctionController.getAuction
);

router.post(
  '/auction/:id/start',
  auctionController.startAuction
);

router.post(
  '/auction/:id/bid',
  auctionController.bid
);

router.post(
  '/auction/:id/mark-as-sold',
  auctionController.markAsSold
);

router.post(
  '/auction/:id/mark-as-unsold',
  auctionController.markAsUnsold
);

module.exports = router;