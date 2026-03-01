import mongoose from "mongoose";

const timeTableSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, min: 1, max: 6, index: true },
    semester: { type: Number, required: true, min: 1, max: 2, index: true },
    classroom: { type: String, required: true, trim: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

timeTableSchema.index({ year: 1, semester: 1, classroom: 1 }, { unique: true });

export default mongoose.models.TimeTable || mongoose.model("TimeTable", timeTableSchema);

