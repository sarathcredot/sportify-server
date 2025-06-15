
const Notification = require('../models/Notification')
const Tournament = require("../models/Tournament");
const { getIO } = require('../config/socket');
const Auction = require('../models/Auction');


module.exports = {
    getAllNotificationByOrganizer: async (organiserId) => {
        return new Promise(async (resolve, reject) => {

            try {

                // create notification 2 days after starting tournaments
                const now = new Date();
                const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

                // STEP 2: Add 2 days to get the target date
                const twoDaysAfter = new Date(todayUTC);
                twoDaysAfter.setUTCDate(todayUTC.getUTCDate() + 2);

                // STEP 3: Get start and end of that target day (in UTC)
                const startOfDay = new Date(twoDaysAfter);
                startOfDay.setUTCHours(0, 0, 0, 0);

                const endOfDay = new Date(twoDaysAfter);
                endOfDay.setUTCHours(23, 59, 59, 999);

                // STEP 4: Query tournaments
                const tournaments = await Tournament.find({
                    createdBy: organiserId,
                    startDate: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }).sort({ createdAt: -1 });


                if (tournaments.length > 0) {

                    for (let elm of tournaments) {

                        const existing = await Notification.findOne({ tournamentId: elm._id, type: "tournament_reminder" })
                        console.log("Tournaments found for reminder:", existing);

                        if (!existing) {

                            const notification = {

                                user: organiserId,
                                tournamentId: elm._id,
                                logoUrl: elm.logoUrl,
                                msg: "Reminder: Your tournament " + elm.name + " is starting soon.",
                                type: "tournament_reminder",
                            }

                            const final = new Notification(notification)
                            await final.save();
                        }
                    }
                }



                // create notification 2 days after starting auction
                // // find this oeganize auction anabeled tournaments

                const auctionTournaments = await Tournament.find({
                    createdBy: organiserId,
                    settings: { auctionEnabled: true },
                })


                if (auctionTournaments.length > 0) {

                    for (let elm of auctionTournaments) {

                        const result = await Auction.findOne(
                            {
                                tournamentId: elm._id,
                                auctionDate: {
                                    $gte: startOfDay,
                                    $lte: endOfDay
                                }
                            }
                        )

                        if (result) {
                            const existing = await Notification.findOne({ tournamentId: elm._id, type: "auction_reminder" })
                            console.log("Auction found for reminder:", existing);

                            if (!existing) {

                                const notification = {

                                    user: organiserId,
                                    tournamentId: elm._id,
                                    logoUrl: elm.logoUrl,
                                    msg: "Reminder: Your auction for tournament " + elm.name + " is starting soon.",
                                    type: "auction_reminder",
                                }

                                const final = new Notification(notification)
                                await final.save();
                            }
                        }


                    }
                }




                const nowDate = new Date();
                const fiveDaysAgo = new Date();
                fiveDaysAgo.setDate(nowDate.getDate() - 5);

                const result = await Notification.find({
                    user: organiserId,
                    $or: [
                        { isViewed: false },
                        {
                            isViewed: true,
                            createdAt: { $gte: fiveDaysAgo } // within last 5 days
                        }
                    ]

                })
                    .sort({ createdAt: -1 });
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
                    { _id: notificationId, user: organiserId },
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
                        notification.logoUrl = getTournament?.logoUrl,
                        notification.user = getTournament?.createdBy,
                        notification.msg = `New player registered in your tournament ${getTournament.name}`,
                        notification.type = data?.type
                }

                if (data?.type === "team_register") {

                    notification.tournamentId = getTournament?._id,
                        notification.logoUrl = gregietTournament?.logoUrl,
                        notification.user = getTournament?.createdBy,
                        notification.msg = `New team registered in your tournament ${getTournament.name}`,
                        notification.type = data?.type
                }

                const final = new Notification(notification)
                const result = await final.save();


                // add sokect.io

                const io = getIO()
                io.to(`${result?.user}-organizer-notification`).emit('notification-sent', { result });
                resolve();

            } catch (error) {

                reject(error);
            }
        });
    },

    notificationAllReadByOrganizer: (organiserId) => {
        return new Promise(async (resolve, reject) => {
            console.log("Marking all notifications as read for organiser:", organiserId);
            try {
                const result = await Notification.updateMany(
                    { user: organiserId, isViewed: false },
                    { $set: { isViewed: true } }
                );

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    getAllNotificationsOfUser: async (userId, page = 1, limit = 10) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Notification.find({ user: userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
                const total = await Notification.countDocuments({ user: userId });
                const unreadCount = await Notification.countDocuments({ user: userId, isViewed: false });
                resolve({
                    notifications: result,
                    pagination: {
                        total,
                        page,
                        limit,
                        unreadCount,
                        totalPages: Math.ceil(total / limit)
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    markNotificationViewed: async (userId, notificationId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { $set: { isViewed: true } }, { new: true });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    markNotificationAllRead: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Notification.updateMany({ user: userId, isViewed: false }, { $set: { isViewed: true } });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
};
