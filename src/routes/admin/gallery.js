


const express = require('express');

const router = express.Router();

const AuctionController=require("../../controllers/auctionController")
const auctionController= new AuctionController()



router.get("/:auctionId",auctionController.getGallery)
router.delete("/:auctionId/:assetId",auctionController.deleteGalleryAsset)
router.get("/:auctionId/:assetId",auctionController.getGalleryAssetbyId)










module.exports=router