import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    session: { type: String, enum: ["FN", "AN", "EN"], required: true },
    subject: { type: String, required: true, trim: true },
    hallNo: { type: String, required: true, trim: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

examScheduleSchema.index({ collegeId: 1, date: 1, session: 1 });

export default mongoose.models.ExamSchedule || mongoose.model("ExamSchedule", examScheduleSchema);

