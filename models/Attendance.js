
//models/Attendance.js
import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  session: { type: String, enum: ["FN", "AN", "EN"], default: "FN" },   // NEW!
  status: {
    type: String,
    enum: ["Present", "Absent"],
    default: "Absent",
  },
  group: {
    type: String,
    enum: ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"],
    required: true,
  },
    yearOfStudy: {
    type: String,
    enum: ['First Year', 'Second Year'],
    required: true,
  },
    lecturerName: { // 🔥 New fields
    type: String,
    required: true,
  },

   lecturerName: { type: String },
   lecturerId: { type: mongoose.Schema.Types.ObjectId, 
    ref: "Lecturer" 

   },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    
  month: {
    type: String,
    enum: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
  },

   year: {
      type: Number,
    },

    // ⭐⭐ NEW FIELD — Attendance Marked Time
    markedAt: {
      type: Date,
      default: Date.now,
    },
  }, 

{
  timestamps: true,
});

attendanceSchema.index({ studentId: 1, date: 1,session: 1 }, { unique: true }); // Ensure unique attendance per student per date per session 
// so that multiple entries for different sessions can exist

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
