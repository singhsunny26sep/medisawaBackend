const mongoose = require('mongoose')

const PrescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        // required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        // required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        // required: true
    },
    medicines: [{
        medicineName: {
            type: String,
            // required: true
        },
        dosage: {
            type: String,
            // required: true
        },
        frequency: {
            type: String,
            // required: true
        },
        duration: {
            type: String,
            // required: true
        },
        description: {
            type: String,
            // required: true
        }
    }],
    prescription: {
        type: String
    },
    clinicSummary: {
        type: String
    },
    allergy: [{
        type: String
    }],
    invastigationAdvice: {
        type: String
    },
    details: {
        type: String
    },
    bp: {
        type: String
    },
    pr: {
        type: String
    },
    temp: {
        type: String
    },
    spo: {
        type: String
    },
    rr: {
        type: String
    },
    rbs: {
        type: String
    },
    digitalSignature: {
        type: String
    },
    clinicIssues: {
        type: String
    }
}, { timestamps: true })

const Prescription = mongoose.model('Prescription', PrescriptionSchema)
module.exports = Prescription