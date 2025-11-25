const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    password: { type: String, minlength: 5 },
    role: {
      type: String,
      default: "patient",
      enum: [
        "user",
        "admin",
        "doctor",
        "manager",
        "hospital",
        "patient",
        "nursing",
        "medical",
        "receptionist",
        "lab",
        "labBoy",
      ],
    },
    address: { type: String },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/194/194915.png",
    },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    patientId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
    fcmToken: { type: String },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", UserSchema);
