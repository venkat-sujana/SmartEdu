// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
    enum: ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT","MLT"],
  },
  caste: {
    type: String,
    required: true,
    enum: ["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC-A", "SC-B","SC-C","SC","ST", "OTHER"],
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  admissionYear: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  // ✅ Photo stored as Cloudinary URL
  photo: {
    type: String,
    default: "", // This should contain a Cloudinary secure_url like https://res.cloudinary.com/...
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },  
} );

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
