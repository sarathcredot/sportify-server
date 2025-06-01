
const express = require('express');
const router = express.Router();
const notificationController = require("../../controllers/notificationController")


// get all notification by team manager
router.get("/", notificationController.getAllNotificationsOfUser)
router.post("/mark-all-as-read", notificationController.markNotificationAllRead)
router.post("/:notificationId", notificationController.markNotificationViewed)

module.exports = router;