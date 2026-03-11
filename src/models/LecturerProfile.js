import mongoose from "mongoose";

const lecturerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    designation: { type: String, required: true, trim: true },
    institutionName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.LecturerProfile ||
  mongoose.model("LecturerProfile", lecturerProfileSchema);
