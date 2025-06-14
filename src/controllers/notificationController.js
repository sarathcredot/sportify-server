const NotificationService = require('../services/notificationService');
const { handleError, handleSuccess } = require('../utils/controllerUtils');

module.exports = {

    getAllNotificationByOrganizer: async (req, res) => {
        try {
            const user = req.user;
            const result = await NotificationService.getAllNotificationByOrganizer(user._id);
            handleSuccess(res, result, 'Notifications retrieved successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    notificationViewByOrganizer: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const user = req.user;
            const result = await NotificationService.notificationViewByOrganizer(user._id, notificationId);
            handleSuccess(res, result, 'Notification viewed successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    notificationAllReadByOrganizer: async (req, res) => {
        console.log("all read by organizer");
        try {
            const user = req.user;
            console.log('User ID:', user?._id);
            const result = await NotificationService.notificationAllReadByOrganizer(user?._id);
            handleSuccess(res, result, 'All notifications marked as read');
        } catch (error) {
            handleError(res, error);
        }
    },

    getAllNotificationsOfUser: async (req, res) => {
        try {
            const user = req.user;
            const { page, limit } = req.query;
            const result = await NotificationService.getAllNotificationsOfUser(user._id, parseInt(page), parseInt(limit));
            handleSuccess(res, result, 'Notifications retrieved successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    markNotificationViewed: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const user = req.user;
            const result = await NotificationService.markNotificationViewed(user._id, notificationId);
            handleSuccess(res, result, 'Notification viewed successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    markNotificationAllRead: async (req, res) => {
        try {
            const user = req.user;
            const result = await NotificationService.markNotificationAllRead(user._id);
            handleSuccess(res, result, 'All notifications marked as read');
        } catch (error) {
            handleError(res, error);
        }
    }
}



