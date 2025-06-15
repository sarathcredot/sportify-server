const Auction = require("../models/Auction");
const AuctionGalleryAsset = require("../models/AuctionGalleryAsset");
const { NotFoundError } = require("../utils/errors");
const { getIO } = require('../config/socket');

class GalleryService {
  async getGallery(auctionId, page = 1, limit = 10) {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const gallery = await AuctionGalleryAsset.find({ auction: auctionId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


    const total = await AuctionGalleryAsset.countDocuments({ auction: auctionId });
    return {
      gallery,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async addGalleryAsset(auctionId, asset) {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const galleryAsset = new AuctionGalleryAsset({
      auction: auctionId,
      assetUrl: asset.assetUrl,
      type: asset.type
    });
    await galleryAsset.save();
    return galleryAsset;
  }

  async deleteGalleryAsset(auctionId, assetId) {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const galleryAsset = await AuctionGalleryAsset.findById(assetId);
    if (!galleryAsset) {
      throw new NotFoundError('Gallery asset not found');
    }
    await AuctionGalleryAsset.findByIdAndDelete(assetId);
    return galleryAsset;
  }

  async playGallery(auctionId) {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new NotFoundError('Auction not found');
    }
    const io = getIO();
    io.to(`auction-${auctionId}`).emit('play-gallery', {
      message: 'play gallery',
      auctionId: auctionId,
    });
    return {};
  }
}

module.exports = new GalleryService(); 