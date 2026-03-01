import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    timetableId: { type: mongoose.Schema.Types.ObjectId, ref: "TimeTable", required: true, index: true },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    period: { type: Number, required: true, min: 1, max: 8 },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "TimetableSubject", required: true },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: "TimetableLecturer", required: true, index: true },
    year: { type: Number, required: true, min: 1, max: 6, index: true },
    semester: { type: Number, required: true, min: 1, max: 2, index: true },
    classroom: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true }
);

timeSlotSchema.index({ timetableId: 1, day: 1, period: 1 }, { unique: true });
timeSlotSchema.index({ day: 1, period: 1, lecturerId: 1 });
timeSlotSchema.index({ day: 1, period: 1, classroom: 1, year: 1, semester: 1 });

export default mongoose.models.TimeSlot || mongoose.model("TimeSlot", timeSlotSchema);

