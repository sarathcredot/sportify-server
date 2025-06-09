const AuctionPlan = require("../models/AuctionPlan");
const { NotFoundError } = require("../utils/errors");

class AuctionPlanService {
  async createAuctionPlan(auctionPlanData) {
    const { maxAllowedTeams, price, isFree, isUnlimitedTeamsAllowed } =
      auctionPlanData;
    console.log("create auction plan", auctionPlanData);

    if (!isFree && price <= 0) {
      throw new Error("Price must be greater than 0 !");
    }

    if (!isUnlimitedTeamsAllowed && maxAllowedTeams <= 0) {
      throw new Error("Maximum allowed teams count is required !");
    }

    const query = { $or: [] };

    if (isFree) {
      query.$or.push({ isFree: true });
    }

    if (isUnlimitedTeamsAllowed) {
      query.$or.push({ isUnlimitedTeamsAllowed: true });
    }

    if (!isUnlimitedTeamsAllowed) {
      query.$or.push({ maxAllowedTeams });
    }

    const auctionPlan = await AuctionPlan.findOne(query);
    if (auctionPlan) {
      let msg = "Auction plan already exists with ";
      if (isFree) {
        msg = "Free auction plan already exists! ";
      }
      if (isUnlimitedTeamsAllowed) {
        msg = "Auction plan already exists with Unlimited Teams! ";
      }
      if (!isUnlimitedTeamsAllowed) {
        msg += `maximum Teams allowed: ${maxAllowedTeams}`;
      }
      throw new Error(msg);
    }

    const newAuctionPlan = new AuctionPlan({
      ...auctionPlanData,
    });
    await newAuctionPlan.save();

    return newAuctionPlan;
  }

  async getAuctionPlans(page, limit, skip) {
    let pipeline = [
      {
        $sort: { maxAllowedTeams: -1 },
      },
    ];

    if (skip && page && limit) {
      page = parseInt(page);
      limit = parseInt(limit);

      pipeline.push(
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
    const {
      maxAllowedTeams,
      isFree,
      isUnlimitedTeamsAllowed,
    } = auctionPlanData;

    const query = { $or: [], _id: { $ne: id } };

    if (isFree) {
      query.$or.push({ isFree: true });
    }

    if (isUnlimitedTeamsAllowed) {
      query.$or.push({ isUnlimitedTeamsAllowed: true });
    }

    if (!isUnlimitedTeamsAllowed) {
      query.$or.push({ maxAllowedTeams });
    }

    const auctionPlanExist = await AuctionPlan.findOne(query);
    if (auctionPlanExist) {
      let msg = "Auction plan already exists with ";
      if (isFree) {
        msg = "Free auction plan already exists! ";
      }
      if (isUnlimitedTeamsAllowed) {
        msg = "Auction plan already exists with Unlimited Teams! ";
      }
      if (!isUnlimitedTeamsAllowed) {
        msg += `maximum Teams allowed: ${maxAllowedTeams}`;
      }
      throw new Error(msg);
    }

    const auctionPlan = await AuctionPlan.findByIdAndUpdate(
      id,
      auctionPlanData,
      { new: true }
    );

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
