const mongoose = require('mongoose');

const auctionGalleryAssetSchema = new mongoose.Schema({
  assetUrl: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('AuctionGalleryAsset', auctionGalleryAssetSchema);