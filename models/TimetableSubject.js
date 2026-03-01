import mongoose from "mongoose";

const timetableSubjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, trim: true, uppercase: true, unique: true },
    year: { type: Number, required: true, min: 1, max: 6, index: true },
    semester: { type: Number, required: true, min: 1, max: 2, index: true },
    hoursPerWeek: { type: Number, required: true, min: 1, max: 30 },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableLecturer",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

timetableSubjectSchema.index({ year: 1, semester: 1 });

export default mongoose.models.TimetableSubject ||
  mongoose.model("TimetableSubject", timetableSubjectSchema);

