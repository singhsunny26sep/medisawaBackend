const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/1430/1430453.png",
    },
    contactNumber: { type: Number, minlength: 10, maxlength: 15 },
    emergencyNumber: { type: Number, minlength: 10, maxlength: 15 },
    address: { type: String },
    dob: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    disease: { type: String },
    department: { type: String },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    allergies: [String],
    medicalHistory: [String],
    medications: [String],
    symptom: [{ type: String }],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Patient", PatientSchema);
