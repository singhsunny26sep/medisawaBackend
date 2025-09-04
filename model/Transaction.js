const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['test', 'appoinment', 'medicine', 'package'],
        // required: true
        default: 'appoinment'
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine'
    },
    labTestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTest'
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
    },
    paymentStatus: {
        type: String,
        default: "pending"
    },
    payment: {
        type: String
    },
    orderId: {
        type: String
    }
}, { timestamps: true })

const Transaction = mongoose.model('Transaction', TransactionSchema)
module.exports = Transaction