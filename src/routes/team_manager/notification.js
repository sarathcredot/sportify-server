
const express = require('express');
const router = express.Router();
const notificationController = require("../../controllers/notificationController")


// get all notification by team manager
router.get("/", notificationController.getAllNotificationsOfUser)
router.post("/:notificationId", notificationController.markNotificationViewed)
router.post("/mark-all-as-read", notificationController.markNotificationAllRead)

module.exports = router;