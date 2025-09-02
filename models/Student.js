
//app/models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    mobile: { type: String, required: true },

    group: {
      type: String,
      required: true,
      enum: ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"],
    },

    caste: {
      type: String,
      required: true,
      enum: [
        "OC",
        "OBC",
        "BC-A",
        "BC-B",
        "BC-C",
        "BC-D",
        "BC-E",
        "SC-A",
        "SC-B",
        "SC-C",
        "SC",
        "ST",
        "OTHER",
      ],
    },

    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },

    admissionNo: { type: String, required: true, unique: true, index: true },

    password: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: true },

    yearOfStudy: {
      type: String,
      required: true,
      enum: ["First Year", "Second Year"],
    },
    admissionYear: { type: Number, required: true },

    dateOfJoining: { type: Date, default: Date.now },

    address: { type: String, required: true },

    photo: { type: String, default: "" },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },

    subjects: [String],

    role: { type: String, default: "student" },
  },
  { timestamps: true }
);

// ✅ CommonJS Export (important)
module.exports =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
