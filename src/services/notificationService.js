
const Notification = require('../models/OrganizerNotification')
const Tournament = require("../models/Tournament");
const { getIO } = require('../config/socket');



module.exports = {
    getAllNotificationByOrganizer: (organiserId) => {
        return new Promise(async (resolve, reject) => {

            try {

                const result = await Notification.find({ organiserId })
                resolve(result)

            } catch (error) {

                reject(error)
            }
        });
    },

    notificationViewByOrganizer: (organiserId, notificationId) => {
        return new Promise(async (resolve, reject) => {

            try {

                const result = await Notification.findOneAndUpdate(
                    { _id: notificationId, organiserId },
                    { $set: { isViewed: true } },
                    { new: true }
                );

                if (!result) {
                    return reject(new Error('Notification not found or already viewed'));
                }

                resolve(result);

            } catch (error) {

                reject(error);
            }
        });
    },

    sendNotificationToOrganizer: async (data) => {

        return new Promise(async (resolve, reject) => {

            try {

                const getTournament = await Tournament.findById({ _id: data?.tournamentId })

                const notification = {}

                if (data?.type === "player_register") {
                    notification.tournamentId = getTournament?._id,
                        notification.organiserId = getTournament?.createdBy,
                        notification.msg = `New player registered in your tournament ${getTournament.name}`,
                        notification.type = data?.type
                }

                if (data?.type === "team_register") {

                    notification.tournamentId = getTournament?._id,
                        notification.organiserId = getTournament?.createdBy,
                        notification.msg = `New team registered in your tournament ${getTournament.name}`,
                        notification.type = data?.type
                }

                const final = new Notification(notification)
                const result = await final.save();

                // add sokect.io

                const io = getIO()
                io.to(`${result?.organiserId}-organizer-notification`).emit('notification-sent', { result });
                resolve();

            } catch (error) {

                reject(error);
            }
        });
    }


};
