import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    session: { type: String, enum: ["FN", "AN", "EN"], required: true },
    subject: { type: String, required: true, trim: true },
    hallNo: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ExamSchedule || mongoose.model("ExamSchedule", examScheduleSchema);

