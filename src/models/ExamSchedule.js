import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    session: { type: String, enum: ["FN", "AN", "EN"], required: true },
    examType: {
      type: String,
      enum: ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4", "QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2"],
      required: true,
    },
    subject: { type: String, trim: true, default: "" },
    hallNo: { type: String, required: true, trim: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "InvigilationRoom" },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

examScheduleSchema.index({ collegeId: 1, date: 1, session: 1 });
examScheduleSchema.index({ collegeId: 1, date: 1, session: 1, hallNo: 1, examType: 1 }, { unique: true });

if (mongoose.models.ExamSchedule) {
  delete mongoose.models.ExamSchedule;
}

export default mongoose.model("ExamSchedule", examScheduleSchema);
