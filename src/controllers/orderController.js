const orderService = require("../services/orderService");
const BaseController = require("./baseController");

class OrderController extends BaseController {
  constructor() {
    super();
    this.createOrder = this.createOrder.bind(this);
    this.getOrders = this.getOrders.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.suspendOrder = this.suspendOrder.bind(this);
    this.subscriptionAnalytics = this.subscriptionAnalytics.bind(this);
    this.getOrganizerActivePosterPlanForTournament =
      this.getOrganizerActivePosterPlanForTournament.bind(this);
    this.getOrganizerActiveAuctionPlan =
      this.getOrganizerActiveAuctionPlan.bind(this);
  }

  async createOrder(req, res) {
    try {
      const orderData = req.body;
      const user = req.user;
      const order = await orderService.createOrder(orderData, user?._id);
      this.handleSuccess(res, order, "Subscription completed successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        skip = "false",
        type,
        planId,
        userId,
        search,
      } = req.query;
      const skipFlag = skip === "true" ? true : false;
      const orders = await orderService.getOrders(
        page,
        limit,
        skipFlag,
        type,
        planId,
        userId,
        search
      );
      this.handleSuccess(res, orders, "Orders retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);
      this.handleSuccess(res, order, "Order retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateOrder(req, res) {
    try {
      const { orderId } = req.params;
      const orderData = req.body;
      const user = req.user;
      const updatedOrder = await orderService.updateOrder(
        {
          id: orderId,
          ...orderData,
        },
        user?._id
      );
      this.handleSuccess(res, updatedOrder, "Order updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async suspendOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { isSuspended } = req.body;
      const suspendedOrder = await orderService.suspendOrder(
        orderId,
        isSuspended
      );
      this.handleSuccess(res, suspendedOrder, "Order suspended successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async subscriptionAnalytics(req, res) {
    try {
      const { orderType, planId } = req.query;
      const analytics = await orderService.subscriptionAnalytics(
        orderType,
        planId
      );
      this.handleSuccess(
        res,
        analytics,
        "Subscription analytics retrieved successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getOrganizerActivePosterPlanForTournament(req, res) {
    try {
      const { tournamentId } = req.query;
      const user = req.user;
      const activePlan =
        await orderService.getOrganizerActivePosterPlanForTournament(
          user?._id,
          tournamentId
        );
      this.handleSuccess(res, activePlan, "Active Plan retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getOrganizerActiveAuctionPlan(req, res) {
    try {
      const { maxAllowedTeams } = req.query;
      const user = req.user;
      const activePlan =
        await orderService.getOrganizerActiveAuctionPlan(
          user?._id,
          maxAllowedTeams && parseInt(maxAllowedTeams)
        );
      this.handleSuccess(
        res,
        activePlan,
        "Active Auction Plan retrieved successfully"
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = OrderController;
