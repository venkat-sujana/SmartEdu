import mongoose from "mongoose";

const timetableLecturerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    department: { type: String, required: true, trim: true },
    maxHoursPerWeek: { type: Number, required: true, min: 1, max: 60, default: 24 },
  },
  { timestamps: true }
);

export default mongoose.models.TimetableLecturer ||
  mongoose.model("TimetableLecturer", timetableLecturerSchema);

