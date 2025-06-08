const AuctionPlan = require("../models/AuctionPlan");
const { NotFoundError } = require("../utils/errors");

class AuctionPlanService {
  async createAuctionPlan(auctionPlanData) {
    const { maxAllowedTeams } = auctionPlanData;
    console.log("create auction plan", auctionPlanData);
    const auctionPlan = await AuctionPlan.findOne({ maxAllowedTeams });
    if (!auctionPlan) {
      throw new Error(`Auction plan Already exists with ${maxAllowedTeams}!`);
    }
    const newAuctionPlan = new AuctionPlan({
      ...auctionPlanData,
    });
    await newAuctionPlan.save();
    return newAuctionPlan;
  }

  async getAuctionPlans(page, limit, skip) {
    let pipeline = [];

    if (skip && page && limit) {
      pipeline.push(
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        }
      );
    }

    const auctionPlans = await AuctionPlan.aggregate(pipeline);

    const total = await AuctionPlan.countDocuments();
    const totalPages = Math.ceil(total / limit);

    if (!auctionPlans || auctionPlans.length === 0) {
      throw new Error("No auction plans found");
    }
    return { auctionPlans, pagination: { total, page, limit, totalPages } };
  }

  async getAuctionPlanById(id) {
    const auctionPlan = await AuctionPlan.findById(id);
    if (!auctionPlan) {
      throw new NotFoundError("Auction plan not found!");
    }
    return auctionPlan;
  }

  async updateAuctionPlan(id, auctionPlanData) {
    const { maxAllowedTeams } = auctionPlanData;
    const auctionPlanExist = await AuctionPlan.findOne({ maxAllowedTeams, _id: { $ne: id } });
    if (!auctionPlanExist) {
      throw new Error(`Auction plan Already exists with ${maxAllowedTeams}!`);
    }
    const auctionPlan = await AuctionPlan.findByIdAndUpdate(id, auctionPlanData, { new: true });
    if (!auctionPlan) {
      throw new NotFoundError("Auction plan not found!");
    }
    return auctionPlan;
  }

  async deleteAuctionPlan(id) {
    const auctionPlan = await AuctionPlan.findByIdAndDelete(id);
    if (!auctionPlan) {
      throw new NotFoundError("Auction plan not found!");
    }
    return auctionPlan;
  }

}

module.exports = new AuctionPlanService();
