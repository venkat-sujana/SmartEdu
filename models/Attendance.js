
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
  month: {
    type: String,
    enum: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
  },
  year: {
    type: Number,
  }
}, {
  timestamps: true,
});

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
