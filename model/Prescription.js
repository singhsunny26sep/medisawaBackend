const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    medicines: [
      {
        medicineName: {
          type: String,
        },
        dosage: {
          type: String,
        },
        frequency: {
          type: String,
        },
        duration: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
    prescription: {
      type: String,
    },
    clinicSummary: {
      type: String,
    },
    allergy: [
      {
        type: String,
      },
    ],
    invastigationAdvice: {
      type: String,
    },
    details: {
      type: String,
    },
    bp: {
      type: String,
    },
    pr: {
      type: String,
    },
    temp: {
      type: String,
    },
    spo: {
      type: String,
    },
    rr: {
      type: String,
    },
    rbs: {
      type: String,
    },
    digitalSignature: {
      type: String,
    },
    clinicIssues: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
