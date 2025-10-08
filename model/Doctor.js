const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String },
    name: {
      type: String,
      minlength: 3,
      maxlength: 50,
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
    experience: { type: Number, min: 0 },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/194/194915.png",
    },
    dob: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    clinicAddress: { type: String },
    contactNumber: {
      type: Number,
      minlength: 10,
      maxlength: 15,
      match: /^[0-9]{10,15}$/,
    },
    clinicContactNumber: {
      type: Number,
      minlength: 10,
      maxlength: 15,
      match: /^[0-9]{10,15}$/,
    },
    coordinates: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    fee: { type: Number },
    oldFee: { type: Number, default: 0 },
    bookingBeforeTime: { type: Number },
    address: { type: String },
    onLeave: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    symptom: [{ type: String }],
  },
  { timestamps: true, versionKey: false }
);

DoctorSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Doctor", DoctorSchema);
