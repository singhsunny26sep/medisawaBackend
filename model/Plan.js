const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    planType: {
        type: String,
    },
    planCost: {
        type: Number,
        required: true
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    discount: {
        type: Number,
        default: 0
        // required: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed'
    }
}, { timestamps: true })


const Plan = mongoose.model('Plan', PlanSchema)
module.exports = Plan;

/* 
doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    treatment: {
        type: String,
        required: true
    },
    medication: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
        required: true
    }
*/