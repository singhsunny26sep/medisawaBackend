const mongoose = require('mongoose')

const PackageBookSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    },
    title: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    amount: {
        type: Number
    },
    paid: {
        type: Boolean,
        default: false
    },
    paidAmount: {
        type: Number
    }
}, { timestamps: true })
const PackageBook = mongoose.model('PackageBook', PackageBookSchema)
module.exports = PackageBook