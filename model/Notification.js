const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        // required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    type: {
        type: String,
        enum: ['booking', 'appointment', 'message', 'review'],
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    title: {
        type: String,
        default: ''
    }
}, { timestamps: true })


const Notification = mongoose.model('Notification', NotificationSchema)
module.exports = Notification;