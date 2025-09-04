const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin', 'doctor', 'manager', 'hospital', 'patient', 'receptionist', 'lab', 'labBoy']
    },
    address: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/194/194915.png'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    patientId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }],
    fcmToken: {
        type: String,
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    }
}, { timestamps: true })
const User = mongoose.model('User', UserSchema);

module.exports = User;