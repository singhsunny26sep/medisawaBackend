const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zipCode: {
        type: String
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'], // Specify GeoJSON format
            // required: true,
        },
        coordinates: {
            type: [Number], // Array to store [longitude, latitude]
            // required: true,
        },
    },
    openTime: {
        type: String
    },
    closeTime: {
        type: String
    },
    isOpen: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })
ClinicSchema.index({ coordinates: '2dsphere' });
const Clinic = mongoose.model('Clinic', ClinicSchema)
module.exports = Clinic