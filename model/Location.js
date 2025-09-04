const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
    },
    pin: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
}, { timestamps: true })

LocationSchema.index({ location: "2dsphere" });

const Location = mongoose.model("Location", LocationSchema);
module.exports = Location


// Create a new location document
/* const locationData = new Location({
    userId,
    address,
    location: {
        type: "Point",
        coordinates,
    },
    country,
    state,
    city,
}); */