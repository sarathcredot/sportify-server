const mongoose = require("mongoose")
const { NOTIFICATION_TYPES } = require("../utils/constants")


const NotificationSchema = new mongoose.Schema({

    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    logoUrl: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    isViewed: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: true,
        enam: NOTIFICATION_TYPES
    },
    data: {
        type: Object,
        required: false
    }
},
    {
        timestamps: true
    })


module.exports = mongoose.model("Notification", NotificationSchema)