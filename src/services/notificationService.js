const Notification = require('../models/Notification')
const Tournament = require("../models/Tournament");
const { getIO } = require('../config/socket');
const Auction = require('../models/Auction');
const TournamentTeams = require('../models/TournamentTeams');

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
                        notification.logoUrl = getTournament?.logoUrl,
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
    },

    sendNotificationAllTeamManagersInTournament: async (tournamentId, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournamentTeams = await TournamentTeams.find({
                    tournament: tournamentId,
                });
                const teamManagerIds = tournamentTeams.map((team) =>
                    team.teamManager.toString()
                );
                const tournament = await Tournament.findById(tournamentId).select('logoUrl')    ;
                const notifications = await Notification.insertMany(teamManagerIds.map((teamManagerId) => ({
                    user: teamManagerId,
                    tournamentId: tournamentId,
                    logoUrl: tournament.logoUrl,
                    msg: data.message,
                    type: "concealed_bid_requested",
                    data: data
                })));
                resolve(notifications);
            } catch (error) {
                reject(error);
            }
        });
    },

    // Send notification to specific team manager
    sendNotificationToTeamManager: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const getTournament = await Tournament.findById({ _id: data?.tournamentId });
                const notification = {
                    user: data?.teamManagerId,
                    tournamentId: getTournament?._id,
                    logoUrl: getTournament?.logoUrl,
                    msg: data?.message,
                    type: data?.type,
                    data: data?.additionalData || {}
                };

                const final = new Notification(notification);
                const result = await final.save();

                // Send socket.io notification
                const io = getIO();
                io.to(result?.user).emit('notification-sent', { result });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    // Send notification to all team managers in tournament
    sendNotificationToAllTeamManagers: async (tournamentId, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournamentTeams = await TournamentTeams.find({
                    tournament: tournamentId,
                });
                const teamManagerIds = tournamentTeams.map((team) =>
                    team.teamManager.toString()
                );
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                
                const notifications = await Notification.insertMany(teamManagerIds.map((teamManagerId) => ({
                    user: teamManagerId,
                    tournamentId: tournamentId,
                    logoUrl: tournament.logoUrl,
                    msg: data.message,
                    type: data.type,
                    data: data.additionalData || {}
                })));

                // Send socket.io notifications to all team managers
                const io = getIO();
                teamManagerIds.forEach(teamManagerId => {
                    io.to(teamManagerId).emit('notification-sent', { 
                        notifications: notifications.filter(n => n.user.toString() === teamManagerId)
                    });
                });

                resolve(notifications);
            } catch (error) {
                reject(error);
            }
        });
    },

    // Team approval/rejection notification
    sendTeamStatusNotification: async (tournamentId, teamId, teamManagerId, status, teamName) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                const message = status === 'approved' 
                    ? `Your team "${teamName}" has been approved for tournament "${tournament.name}"`
                    : `Your team "${teamName}" has been rejected for tournament "${tournament.name}"`;

                const notification = {
                    user: teamManagerId,
                    tournamentId: tournamentId,
                    logoUrl: tournament.logoUrl,
                    msg: message,
                    type: `team_${status}`,
                    data: {
                        teamId: teamId,
                        teamName: teamName,
                        status: status
                    }
                };

                const final = new Notification(notification);
                const result = await final.save();

                // Send socket.io notification
                const io = getIO();
                io.to(result?.user).emit('notification-sent', { result });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    // Player sold notification to all team managers
    sendPlayerSoldNotification: async (tournamentId, playerData, winningTeam, bidAmount) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                const message = `Player ${playerData.firstName} ${playerData.lastName || ''} has been sold to ${winningTeam.name} for ${bidAmount} points`;

                await this.sendNotificationToAllTeamManagers(tournamentId, {
                    message: message,
                    type: 'player_sold',
                    additionalData: {
                        playerId: playerData._id,
                        playerName: `${playerData.firstName} ${playerData.lastName || ''}`,
                        winningTeamId: winningTeam._id,
                        winningTeamName: winningTeam.name,
                        bidAmount: bidAmount
                    }
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    // Player unsold notification to all team managers
    sendPlayerUnsoldNotification: async (tournamentId, playerData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                const message = `Player ${playerData.firstName} ${playerData.lastName || ''} went unsold in the auction`;

                await this.sendNotificationToAllTeamManagers(tournamentId, {
                    message: message,
                    type: 'player_unsold',
                    additionalData: {
                        playerId: playerData._id,
                        playerName: `${playerData.firstName} ${playerData.lastName || ''}`
                    }
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    // Auction started notification
    sendAuctionStartedNotification: async (tournamentId, auctionData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                const message = `Auction for tournament "${tournament.name}" has started!`;

                await this.sendNotificationToAllTeamManagers(tournamentId, {
                    message: message,
                    type: 'auction_started',
                    additionalData: {
                        auctionId: auctionData._id,
                        auctionDate: auctionData.auctionDate
                    }
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    // Auction completed notification
    sendAuctionCompletedNotification: async (tournamentId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                const message = `Auction for tournament "${tournament.name}" has been completed!`;

                await this.sendNotificationToAllTeamManagers(tournamentId, {
                    message: message,
                    type: 'auction_completed',
                    additionalData: {
                        tournamentName: tournament.name
                    }
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    // New player available for bidding
    sendNewPlayerBiddingNotification: async (tournamentId, playerData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                const message = `New player ${playerData.firstName} ${playerData.lastName || ''} is now available for bidding`;

                await this.sendNotificationToAllTeamManagers(tournamentId, {
                    message: message,
                    type: 'new_player_bidding',
                    additionalData: {
                        playerId: playerData._id,
                        playerName: `${playerData.firstName} ${playerData.lastName || ''}`,
                        playerCategory: playerData.category
                    }
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    // Bid placed notification (to all team managers)
    sendBidPlacedNotification: async (tournamentId, playerData, bidAmount, teamName) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tournament = await Tournament.findById(tournamentId).select('logoUrl name');
                const message = `New bid of ${bidAmount} points placed for ${playerData.firstName} ${playerData.lastName || ''} by ${teamName}`;

                await this.sendNotificationToAllTeamManagers(tournamentId, {
                    message: message,
                    type: 'bid_placed',
                    additionalData: {
                        playerId: playerData._id,
                        playerName: `${playerData.firstName} ${playerData.lastName || ''}`,
                        bidAmount: bidAmount,
                        teamName: teamName
                    }
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
};
