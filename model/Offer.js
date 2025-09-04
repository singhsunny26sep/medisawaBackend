const mongoose = require('mongoose')

const OfferSchema = new mongoose.Schema({
    title: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    discount: {
        type: Number,
        // required: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        // required: true
        default: "percentage"
    },
    startDate: {
        type: Date,
        // required: true
    },
    endDate: {
        type: Date,
        // required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    image: {
        type: String
    }
}, { timestamps: true })

const Offer = mongoose.model('Offer', OfferSchema)
module.exports = Offer