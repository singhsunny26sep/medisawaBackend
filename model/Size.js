const mongoose = require('mongoose')

const SizeSchema = new mongoose.Schema({
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
    },
    size: {
        type: String
    },
    unit: {
        type: String
    },
    price: {
        type: Number
    },
    quntity: {
        type: Number
    },
    discount: {
        type: Number,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    }
}, { timestamps: true })
const Size = mongoose.model('Size', SizeSchema)
module.exports = Size