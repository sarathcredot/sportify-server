const { Types } = require("mongoose");
const AuctionPlan = require("../models/AuctionPlan");
const Order = require("../models/Order");
const PosterPlan = require("../models/PosterPlan");
const { ORDER_TYPE, ORDER_STATUS } = require("../utils/constants");
const Tournament = require("../models/Tournament");

class OrderService {
  async createOrder(orderData, user) {
    const {
      type,
      orderStatus,
      paymentDetails,
      auctionPlan,
      posterPlan,
      tournament,
    } = orderData;

    if (!user) {
      throw new Error("Can't find User!");
    }

    //AUCTION PLAN CHECKS
    if (type === ORDER_TYPE.AUCTION_PLAN && !auctionPlan) {
      throw new Error("Auction Plan is required !");
    }

    const auctionPlanExists = await AuctionPlan.findById(auctionPlan);

    if (type === ORDER_TYPE.AUCTION_PLAN && !auctionPlanExists) {
      throw new Error("Auction Plan does not exist !");
    }

    if (
      type === ORDER_TYPE.AUCTION_PLAN &&
      auctionPlanExists &&
      !auctionPlanExists.isActive
    ) {
      throw new Error("Auction Plan is currently not available !");
    }

    //POSTER PLAN CHECKS
    if (type === ORDER_TYPE.POSTER_PLAN && !posterPlan) {
      throw new Error("Plan is required !");
    }

    const posterPlanExists = await PosterPlan.findById(posterPlan);

    if (type === ORDER_TYPE.POSTER_PLAN && !posterPlanExists) {
      throw new Error("Plan does not exist !");
    }

    if (
      type === ORDER_TYPE.POSTER_PLAN &&
      posterPlanExists &&
      posterPlanExists?.isActive === false
    ) {
      throw new Error("Plan is currently not available !");
    }

    if (
      type === ORDER_TYPE.POSTER_PLAN &&
      posterPlanExists &&
      !posterPlanExists.isActive
    ) {
      throw new Error("Plan is not active !");
    }

    //POSTER_PLAN ORDER EXIST FOR SAME TOURNAMENT AND USER CHECKS
    if (type === ORDER_TYPE.POSTER_PLAN && tournament) {
      const existingOrder = await Order.findOne({
        type: ORDER_TYPE.POSTER_PLAN,
        posterPlan: new Types.ObjectId(posterPlan),
        tournament: new Types.ObjectId(tournament),
        user: new Types.ObjectId(user),
        isUsed: false,
        isExpired: false,
      });

      if (existingOrder) {
        throw new Error("Same Plan already exists for this tournament !");
      }
    }

    //SAME AUCTION_PLAN ORDER EXIST FOR SAME USER CHECKS
    if (type === ORDER_TYPE.AUCTION_PLAN) {
      const existingOrder = await Order.findOne({
        type: ORDER_TYPE.AUCTION_PLAN,
        auctionPlan: new Types.ObjectId(auctionPlan),
        user: new Types.ObjectId(user),
        isUsed: false,
        isExpired: false,
      });

      if (existingOrder) {
        throw new Error("Same Auction Plan already purchased !");
      }
    }

    const newOrder = new Order(orderData);
    await newOrder.save();

    return newOrder;
  }

  async getOrders(page, limit, skip, type, planId, user, search) {
    let matchObj = {};

    if (type) {
      matchObj.type = type;
    }

    if (type === ORDER_TYPE.POSTER_PLAN) {
      matchObj.posterPlan = new Types.ObjectId(planId);
    }

    if (type === ORDER_TYPE.AUCTION_PLAN) {
      matchObj.auctionPlan = new Types.ObjectId(planId);
    }

    if (user) {
      matchObj.user = new Types.ObjectId(user);
    }

    let pipeline = [
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "auctionplans",
          localField: "auctionPlan",
          foreignField: "_id",
          as: "auctionPlan",
        },
      },
      {
        $unwind: {
          path: "$auctionPlan",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "posterplans",
          localField: "posterPlan",
          foreignField: "_id",
          as: "posterPlan",
        },
      },
      {
        $unwind: {
          path: "$posterPlan",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "tournaments",
          localField: "tournament",
          foreignField: "_id",
          as: "tournament",
        },
      },
      {
        $unwind: {
          path: "$tournament",
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "user.fullName": {
                $regex: new RegExp(createFlexibleRegex(search), "i"),
              },
            },
            {
              "user.phoneNumber": {
                $regex: new RegExp(createFlexibleRegex(search), "i"),
              },
            },
          ],
        },
      });
    }

    if (skip && page && limit) {
      
      page = parseInt(page);
      limit = parseInt(limit);

      if(search){
        page = 1
      }

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

    const orders = await Order.aggregate(pipeline);

    const total = await Order.countDocuments();
    const totalPages = Math.ceil(total / limit);

    if (!orders || orders.length === 0) {
      throw new Error("No orders found");
    }
    return { orders, pagination: { total, page, limit, totalPages } };
  }

  async getOrderById(id) {
    if (!id) {
      throw new Error("Can't find Order!");
    }

    const order = await Order.findById(id);

    if (!order) {
      throw new Error("Order not found!");
    }

    return order;
  }

  async updateOrder(orderData, user) {
    const {
      id,
      orderStatus,
      paymentDetails,
      tournament,
      isUsed,
      isExpired,
      isSuspended,
    } = orderData;

    if (!user) {
      throw new Error("Can't find User!");
    }

    if (!id) {
      throw new Error("Can't find Order!");
    }

    const order = await Order.findById(id);

    if (!order) {
      throw new Error("Order not found!");
    }

    if (orderStatus && Object.values(ORDER_STATUS).includes(orderStatus)) {
      order.orderStatus = orderStatus;
    }

    if (paymentDetails) {
      order.paymentDetails = paymentDetails;
    }

    if (typeof isUsed === "boolean") {
      order.isUsed = isUsed;
    }

    if (typeof isExpired === "boolean") {
      order.isExpired = isExpired;
    }

    if (tournament) {
      const tournamentExists = await Tournament.findById(tournament);
      if (!tournamentExists) {
        throw new Error("Tournament does not exist!");
      }

      const existingOrder = await Order.findOne({
        type: order.type,
        tournament: new Types.ObjectId(tournament),
        user: new Types.ObjectId(user),
        isUsed: false,
        isExpired: false,
        _id: { $ne: order._id }, // Exclude the current order from the check
      });

      if (existingOrder) {
        throw new Error("Same order already exists for this tournament!");
      }

      order.tournament = new Types.ObjectId(tournament);
    }

    await order.save();

    return order;
  }

  async suspendOrder(orderId, isSuspended) {
    if (!orderId) {
      throw new Error("Order ID is required!");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found!");
    }

    order.isSuspended = isSuspended;
    await order.save();

    return order;
  }

  async subscriptionAnalytics(orderType, planId) {
    if (!orderType) throw new Error("Invalid Order Type!");
    if (!planId) throw new Error("Invalid Plan!");

    const matchObj = {
      type: orderType,
    };

    if (orderType === ORDER_TYPE.POSTER_PLAN) {
      matchObj.posterPlan = new Types.ObjectId(planId);
    }

    if (orderType === ORDER_TYPE.AUCTION_PLAN) {
      matchObj.auctionPlan = new Types.ObjectId(planId);
    }

    const pipeline = [
      { $match: matchObj },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          activeOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isExpired", false] },
                    { $eq: ["$isSuspended", false] },
                    { $eq: ["$isUsed", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          expiredOrders: {
            $sum: {
              $cond: [{ $eq: ["$isExpired", true] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: "$paymentDetails.amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          activeOrders: 1,
          expiredOrders: 1,
          totalRevenue: 1,
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    return (
      result[0] || {
        totalOrders: 0,
        activeOrders: 0,
        expiredOrders: 0,
        totalRevenue: 0,
      }
    );
  }
}

module.exports = new OrderService();
