const { z } = require("zod");
const { extendZodWithOpenApi } = require("zod-openapi");
const { ORDER_TYPE, ORDER_STATUS } = require("../utils/constants");

extendZodWithOpenApi(z);

// Define enums
const OrderTypeEnum = z.enum(Object.values(ORDER_TYPE));
const OrderStatusEnum = z.enum(Object.values(ORDER_STATUS));

// Define nested payment details schema (optional)
const paymentDetailsSchema = z.object({
  paymentId: z.string().optional(),
  status: OrderStatusEnum.optional(),
  paymentMethod: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
});

const createOrderSchema = z
  .object({
    type: OrderTypeEnum,
    orderStatus: OrderStatusEnum.optional().default(ORDER_STATUS.PENDING),
    isUsed: z.boolean().optional().default(false),
    isExpired: z.boolean().optional().default(false),
    paymentDetails: paymentDetailsSchema.optional(),

    auctionPlan: z.string().optional(),
    posterPlan: z.string().optional(),
    tournament: z.string().optional(),
    user: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.type === ORDER_TYPE.AUCTION_PLAN && !data.auctionPlan) {
      ctx.addIssue({
        path: ["auctionPlan"],
        message: "auctionPlan is required when type is 'auction_plan'",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.type === ORDER_TYPE.POSTER_PLAN && !data.posterPlan) {
      ctx.addIssue({
        path: ["posterPlan"],
        message: "posterPlan is required when type is 'poster_plan'",
        code: z.ZodIssueCode.custom,
      });
    }
  });

module.exports = {
  createOrderSchema,
};
