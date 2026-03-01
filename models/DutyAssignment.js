import mongoose from "mongoose";

const dutyAssignmentSchema = new mongoose.Schema(
  {
    examScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSchedule",
      required: true,
    },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    availability: {
      type: String,
      enum: ["Pending", "Available", "Not Available"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

dutyAssignmentSchema.index({ examScheduleId: 1, lecturerId: 1 }, { unique: true });

export default mongoose.models.DutyAssignment ||
  mongoose.model("DutyAssignment", dutyAssignmentSchema);

