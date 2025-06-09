const { Types } = require("mongoose");
const PosterPlan = require("../models/PosterPlan");
const { PLANS_TYPES } = require("../utils/constants");
const { NotFoundError } = require("../utils/errors");

class PosterPlanService {
  async createPosterPlan(posterPlanData) {
    const { name, type } = posterPlanData;

    const posterPlan = await PosterPlan.findOne({ $or: [{ name }, { type }] });
    if (posterPlan) {
      throw new Error(` ${name} plan Already exists!`);
    }
    const newPosterPlan = new PosterPlan(posterPlanData);
    await newPosterPlan.save();
    return newPosterPlan;
  }

  async getPosterPlans() {
    const posterPlans = await PosterPlan.find();
    return posterPlans;
  }

  async getPosterPlanById(id) {
    const posterPlan = await PosterPlan.findById(id);
    if (!posterPlan) {
      throw new NotFoundError(" plan not found!");
    }
    return posterPlan;
  }

  async updatePosterPlan(id, posterPlanData) {
    const { isActive, price, description, name, type } = posterPlanData;

    const obj = {};

    if (name && type) {
      const posterPlan = await PosterPlan.findOne({
        $or: [{ name }, { type }],
        _id: { $ne: new Types.ObjectId(id) },
      });

      if (posterPlan) {
        throw new Error(` ${name} plan Already exists!`);
      }

      obj.name = name;
      obj.type = type;
    }

    if (price) {
      obj.price = price;
    }

    if (description) {
      obj.description = description;
    }

    if (typeof isActive === "boolean") {
      obj.isActive = isActive;
    }

    const posterPlan = await PosterPlan.findByIdAndUpdate(id, obj, {
      new: true,
    });

    if (!posterPlan) {
      throw new NotFoundError("plan not found!");
    }
    return posterPlan;
  }

  async deletePosterPlan(id) {
    const posterPlan = await PosterPlan.findByIdAndDelete(id);
    if (!posterPlan) {
      throw new NotFoundError("plan not found!");
    }
    return posterPlan;
  }
}

module.exports = new PosterPlanService();
