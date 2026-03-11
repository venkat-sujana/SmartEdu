// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
       type: String, 
       required: true,
       trim: true 
      },
    fatherName: { 
      type: String, 
      required: true,
      trim: true 
    },
    mobile: { 
      type: String, 
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Mobile must be a valid 10-digit Indian number"] 
    },

    group: {
      type: String,
      required: true,
      trim: true,
      enum: ["MPC", "BiPC", "BIPC", "CEC", "HEC", "CET", "M&AT", "MLT"],
    },

    caste: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      enum: ["OC","OBC","BC-A","BC-B","BC-C","BC-D","BC-E","SC-A","SC-B","SC-C","SC","ST","OTHER"],
    },

    dob: { 
      type: Date, 
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "DOB cannot be in the future",
      }, 
    },

    gender: { 
      type: String, 
      required: true,
      trim: true,
       enum: ["Male", "Female", "Other"] 
      },

    admissionNo: { 
      type: String, 
      required: true, 
      trim: true
     },

    password: { 
      type: String,
       required: true 
      },

    mustChangePassword: { 
      type: Boolean, 
      default: true 
    },

    yearOfStudy: {
      type: String,
      required: true,
      trim: true,
      enum: ["First Year", "Second Year"],
    },

     // ⭐ NEW FIELD — second year complete అయినప్పుడు ఈ ఫీల్డ్ update అవుతుంది
    status: {
      type: String,
      trim: true,
      enum: ["Active", "Terminated"],
      default: "Active",
    },

    admissionYear: 
    { type: Number, 
      required: true,
      min: [2000, "Admission year looks too old"],
      max: [new Date().getFullYear() + 1, "Admission year cannot be far in the future"] 
    },

    dateOfJoining: 
    { type: Date, 
      default: Date.now 
    },

    address: 
    { type: String, 
      required: true,
      trim: true 
    },

    photo: { 
      type: String, 
      default: "" 
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },

    subjects: [String],

    role: 
    { type: String, 
      default: "student",
      trim: true 
    },
  },
  { timestamps: true }
);

// Multi-tenant safe unique admission number (per college).
studentSchema.index({ collegeId: 1, admissionNo: 1 }, { unique: true });

// Common dashboard/filter queries by college + status/year.
studentSchema.index({ collegeId: 1, status: 1, yearOfStudy: 1 });

// Common listings sorted by newest in a college.
studentSchema.index({ collegeId: 1, createdAt: -1 });

export default mongoose.models.Student || mongoose.model("Student", studentSchema);
