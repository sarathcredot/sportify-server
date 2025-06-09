const express = require("express");
const OrderController = require("../../controllers/orderController");

const router = express.Router();
const orderController = new OrderController();

router.get("/", orderController.getOrders);
router.get("/:orderId", orderController.getOrderById);
router.get("/subsciption/analytics", orderController.subscriptionAnalytics);
router.patch("/suspend/:orderId", orderController.suspendOrder);

module.exports = router;
