const express = require("express");
const validate = require("../../utils/validate");
const OrderController = require("../../controllers/orderController");
const { createOrderSchema } = require("../../schemas/orderSchema");

const router = express.Router();
const orderController = new OrderController();

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:orderId", orderController.getOrderById);
router.get(
  "/active/plan",
  orderController.getOrganizerActivePosterPlanForTournament
);
router.get(
  "/active/auctionPlan",
  orderController.getOrganizerActiveAuctionPlan
);
router.patch("/:orderId", orderController.updateOrder);
router.get("/:planId/plan-count", orderController.getPurchasedPlansCount)

module.exports = router;
