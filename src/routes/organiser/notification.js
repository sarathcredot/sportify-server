
const express = require('express');
const router = express.Router();
const notificationController = require("../../controllers/notificationController")



// get all notification by organizer
router.get("/", notificationController.getAllNotificationByOrganizer)
router.post("/:notificationId", notificationController.notificationViewByOrganizer)
router.patch("/notification-all-read", notificationController.notificationAllReadByOrganizer)

module.exports = router;