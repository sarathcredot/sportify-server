const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Tournament = require('../models/Tournament');
require('dotenv').config();

const userId = "6800e70e5c037f229823c181";

async function createNotifications() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get a sample tournament
        const sampleTournament = await Tournament.findOne().sort({ createdAt: -1 });
        
        if (!sampleTournament) {
            throw new Error('No tournament found to create notifications');
        }

        const notifications = [
            {
                tournamentId: sampleTournament._id,
                logoUrl: sampleTournament.logoUrl,
                user: userId,
                msg: "Welcome to SportifyPro! Your account has been successfully created.",
                type: "player_register",
                isViewed: false
            },
            {
                tournamentId: sampleTournament._id,
                logoUrl: sampleTournament.logoUrl,
                user: userId,
                msg: "New tournament available: " + sampleTournament.name,
                type: "tournament_reminder",
                isViewed: false
            },
            {
                tournamentId: sampleTournament._id,
                logoUrl: sampleTournament.logoUrl,
                user: userId,
                msg: "Upcoming auction for tournament: " + sampleTournament.name,
                type: "auction_reminder",
                isViewed: false
            }
        ];

        const createdNotifications = await Notification.insertMany(notifications);
        console.log('Successfully created notifications:', createdNotifications);

    } catch (error) {
        console.error('Error creating notifications:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createNotifications(); 