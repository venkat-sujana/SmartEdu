import mongoose from "mongoose";

const AttendanceSmsLogSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    group: {
      type: String,
      trim: true,
      index: true,
    },
    yearOfStudy: {
      type: String,
      trim: true,
      index: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    threshold: {
      type: Number,
      default: 75,
    },
    message: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      default: "fast2sms",
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      default: "sent",
      index: true,
    },
    error: {
      type: String,
      default: "",
      trim: true,
    },
    triggeredByRole: {
      type: String,
      trim: true,
    },
    triggeredByName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

AttendanceSmsLogSchema.index({ collegeId: 1, createdAt: -1 });
AttendanceSmsLogSchema.index({ collegeId: 1, group: 1, createdAt: -1 });

export default mongoose.models.AttendanceSmsLog ||
  mongoose.model("AttendanceSmsLog", AttendanceSmsLogSchema);
