// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
{
  name: { type: String, required: true, trim: true },

  fatherName: { type: String, required: true, trim: true },

  mobile: {
    type: String,
    required: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, "Mobile must be a valid 10-digit Indian number"]
  },

  parentMobile: {
    type: String,
    required: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, "Parent mobile must be a valid 10-digit Indian number"]
  },

  group: {
    type: String,
    required: true,
    trim: true
  },

  caste: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    enum: [
      "OC","OBC","BC-A","BC-B","BC-C","BC-D","BC-E",
      "SC-A","SC-B","SC-C","SC","ST","OTHER"
    ]
  },

  dob: {
    type: Date,
    validate: {
      validator: (value) => !value || value <= new Date(),
      message: "DOB cannot be in the future"
    }
  },

  gender: {
    type: String,
    required: true,
    trim: true,
    enum: ["Male","Female","Other"]
  },

  yearOfStudy: {
    type: String,
    required: true,
    trim: true,
    enum: ["First Year","Second Year"]
  },

  status: {
    type: String,
    trim: true,
    enum: ["Active","Terminated"],
    default: "Active"
  },

  admissionYear: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1
  },

  dateOfJoining: { type: Date, default: Date.now },

  address: { type: String, required: true, trim: true },

  admissionNo: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },

  photo: { type: String, default: "" },

  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
    index: true
  },

  subjects: {
    type: [String],
    index: true
  },

  password: { type: String, trim: true },

  role: { type: String, default: "student", trim: true }

},
{ timestamps: true }
);


// Student indexes optimized



// DASHBOARD FILTER INDEX
studentSchema.index({ collegeId: 1, status: 1, yearOfStudy: 1 });


// GROUP FILTER
studentSchema.index({ collegeId: 1, group: 1, yearOfStudy: 1 });


// SEARCH INDEX (important)
studentSchema.index({ name: "text" });


// ADMISSION UNIQUE INDEX
studentSchema.index(
  { admissionNo: 1 },
  {
    unique: true,
    partialFilterExpression: {
      admissionNo: { $type: "string", $gt: "" }
    }
  }
);


// SORT OPTIMIZATION
studentSchema.index({ collegeId: 1, createdAt: -1 });


export default mongoose.models.Student ||
mongoose.model("Student", studentSchema);
