// models/TimetableLecturers.js
import mongoose, { Schema } from "mongoose";

const timetableLecturerSchema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    name:      { type: String, required: true, trim: true },
    subjects:  { type: [String], default: [] },          // teach చేసే subjects

    minPeriodsPerWeek: { type: Number, default: 16 },
    maxPeriodsPerWeek: { type: Number, default: 24 },

    color:    { type: String, default: "#3b82f6" },      // UI color
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

timetableLecturerSchema.index({ collegeId: 1, name: 1 }, { unique: true });

export default mongoose.models.TimetableLecturer ||
  mongoose.model("TimetableLecturer", timetableLecturerSchema);
