const notificationService = require('../services/notificationService');
const { handleError, handleSuccess } = require('../utils/controllerUtils');

module.exports = {

    getAllNotificationByOrganizer: async (req, res) => {
        try {
            const user = req.user;
            const result = await notificationService.getAllNotificationByOrganizer(user._id);
            handleSuccess(res, result, 'Notifications retrieved successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    notificationViewByOrganizer: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const user = req.user;
            const result = await notificationService.notificationViewByOrganizer(user._id, notificationId);
            handleSuccess(res, result, 'Notification viewed successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    notificationAllReadByOrganizer: async (req, res) => {
        try {
            const user = req.user;
            const result = await notificationService.notificationAllReadByOrganizer(user._id);
            handleSuccess(res, result, 'All notifications marked as read');
        } catch (error) {
            handleError(res, error);
        }
    },

    getAllNotificationsOfUser: async (req, res) => {
        try {
            const user = req.user;
            const result = await notificationService.getAllNotificationsOfUser(user._id);
            handleSuccess(res, result, 'Notifications retrieved successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    markNotificationViewed: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const user = req.user;
            const result = await notificationService.markNotificationViewed(user._id, notificationId);
            handleSuccess(res, result, 'Notification viewed successfully');
        } catch (error) {
            handleError(res, error);
        }
    },

    markNotificationAllRead: async (req, res) => {
        try {
            const user = req.user;
            const result = await notificationService.markNotificationAllRead(user._id);
            handleSuccess(res, result, 'All notifications marked as read');
        } catch (error) {
            handleError(res, error);
        }
    }
}



