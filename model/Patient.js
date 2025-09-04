const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        default: 'https://cdn-icons-png.flaticon.com/512/1430/1430453.png'
    },
    contactNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 15
    },
    emergencyNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 15
    },
    address: {
        type: String,
        required: true
    },
    dob: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    disease: {
        type: String,
        // required: true
    },
    department: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        // required: true
    },
    allergies: [String],
    medicalHistory: [String],
    medications: [String],
    symptom: [{ type: String }],
}, { timestamps: true })
const Patient = mongoose.model('Patient', PatientSchema)

module.exports = Patient