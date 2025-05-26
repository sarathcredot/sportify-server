
const { base } = require('../models/Tournament');
const notificationService = require('../services/notificationService');
const ResponseHandler = require('../utils/responseHandler');
const BaseController = require('./baseController');


module.exports = {


    getAllNotificationByOrganizer: async (req, res) => {

        try {

            const user = req.user;

            const result = await notificationService.getAllNotificationByOrganizer(user._id);

            res.status(200).json(ResponseHandler.success('Notifications retrieved successfully', result));

        } catch (error) {

            BaseController.handleError(res, error);
        }
    },

    notificationViewByOrganizer: async (req, res) => {
        try {

            const { notificationId } = req.params;

            const user = req.user;

            const result = await notificationService.notificationViewByOrganizer(user._id, notificationId);

            res.status(200).json(ResponseHandler.success('Notification viewed successfully', result));

        } catch (error) {

            BaseController.handleError(res, error);
        }
    }
}