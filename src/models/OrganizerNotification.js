

const mongoose = require("mongoose")
const { ORGANISER_NOTIFICATION_TYPE } = require("../utils/constants")


const organiserNotificationSchema = new mongoose.Schema({

    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    logoUrl: {
        type: String,
        required: false
    },
    organiserId: {
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
        enam: ORGANISER_NOTIFICATION_TYPE
    }
},
    {
        timestamps: true
    })


module.exports = mongoose.model("organizerNotification", organiserNotificationSchema)