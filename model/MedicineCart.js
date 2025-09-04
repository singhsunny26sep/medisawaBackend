const mongoose = require('mongoose')

const MedicineCartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine'
    },
    quantity: {
        type: Number,
        default: 1
    },
    amount: {
        type: Number
    },
    sizeId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size'
    }]
}, { timestamps: true })
const MedicineCart = mongoose.model('MedicineCart', MedicineCartSchema)
module.exports = MedicineCart