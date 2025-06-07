const { z } = require("zod");
const { extendZodWithOpenApi } = require("zod-openapi");
const { ORDER_TYPE, ORDER_STATUS } = require("../utils/constants");

extendZodWithOpenApi(z);

const createOrderSchema = z
  .object({
    type: z.enum(Object.values(ORDER_TYPE)),
    status: z
      .enum(Object.values(ORDER_STATUS))
      .optional()
      .default(ORDER_STATUS.PENDING),
    auctionPlan: z.string().optional(),
    posterPlan: z.string().optional(),
    tournament: z.string(),
    user: z.string(),
  })
  .refine((data) => {
    if (data.type === ORDER_TYPE.AUCTION_PLAN) return !!data.auctionPlan;
    if (data.type === ORDER_TYPE.POSTER_PLAN) return !!data.posterPlan;
    return true;
  }, {
    message: "auctionPlan or posterPlan is required based on order type",
    path: ["type"],
  });

module.exports = {
  createOrderSchema,
};
