// models/Attendance.js

import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema(
{
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },

  collegeId: {
    type: Schema.Types.ObjectId,
    ref: "College",
    required: true,
    index: true
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  session: {
    type: String,
    enum: ["FN", "AN"],
    default: "FN"
  },

  status: {
    type: String,
    enum: ["Present", "Absent"],
    default: "Absent",
    index: true
  },

  group: {
    type: String,
    enum: ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"],
    required: true,
    index: true
  },

  yearOfStudy: {
    type: String,
    enum: ["First Year", "Second Year"],
    required: true,
    index: true
  },

  lecturerName: {
    type: String,
    trim: true
  },

  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecturer",
    index: true
  },

  month: {
    type: Number, // 1-12 (faster than string)
    min: 1,
    max: 12,
    index: true
  },

  year: {
    type: Number,
    index: true
  },

  markedAt: {
    type: Date,
    default: Date.now
  }

},
{
  timestamps: true
}
);


// prevent duplicate attendance
attendanceSchema.index(
  { studentId: 1, date: 1, session: 1 },
  { unique: true }
);


// dashboard queries
attendanceSchema.index({
  collegeId: 1,
  group: 1,
  yearOfStudy: 1,
  date: -1
});


// monthly reports
attendanceSchema.index({
  collegeId: 1,
  month: 1,
  year: 1
});


// student attendance history
attendanceSchema.index({
  studentId: 1,
  date: -1
});


export default mongoose.models.Attendance ||
mongoose.model("Attendance", attendanceSchema);