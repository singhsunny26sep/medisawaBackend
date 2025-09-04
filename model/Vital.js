const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    height: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    bmi: {
        type: Number
    },
    bloodPressure: {
        type: String
    },
    temperature: {
        type: Number
    },
    pulseRate: {
        type: Number
    },
    respirationRate: {
        type: Number
    },
}, { timestamps: true })
const Vital = mongoose.model('Vitel', VitalSchema)
module.exports = Vital;