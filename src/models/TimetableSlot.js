// models/TimetableSlot.js
import mongoose, { Schema } from "mongoose";
const timetableSlotSchema = new Schema(
  {
    collegeId:    { type: Schema.Types.ObjectId, ref: "College", required: true, index: true },
    classLabel:   { type: String, required: true, trim: true },   // "FIRST YEAR SCIENCE - GENERAL"
    stream:       { type: String, enum: ["general","vocational"], index: true },
    academicYear: { type: String, required: true, default: "2026-2027", index: true },

    // Slot position
    day:          { type: String, required: true, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], index: true },
    periodIndex:  { type: Number, required: true, min: 0, max: 9 },   // COLUMNS array index
    periodLabel:  { type: String, required: true, trim: true },        // "9:10 - 10:00"
    periodType:   { type: String, enum: ["period","break","lunch"], default: "period" },

    // Content
    subject:      { type: String, trim: true, default: "" },
    lecturerName: { type: String, trim: true, default: "" },
    lecturerId:   { type: Schema.Types.ObjectId, ref: "TimetableLecturer", default: null },
    subjectColor: { type: String, default: "#e2e8f0" },

    // Flags
    isLocked:    { type: Boolean, default: false },   // auto-gen skip చేస్తుంది
    isPractical: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Duplicate prevent
timetableSlotSchema.index(
  { collegeId: 1, classLabel: 1, day: 1, periodIndex: 1, academicYear: 1 },
  { unique: true }
);

// Conflict detection
timetableSlotSchema.index({ collegeId: 1, academicYear: 1, day: 1, periodIndex: 1, lecturerName: 1 });

// Class load
timetableSlotSchema.index({ collegeId: 1, classLabel: 1, academicYear: 1 });

export default mongoose.models.TimetableSlot ||
mongoose.model("TimetableSlot", timetableSlotSchema);
