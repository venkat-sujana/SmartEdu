import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  records: {
    type: Map,
    of: String, // studentId: "Present"/"Absent"
  },
});

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
