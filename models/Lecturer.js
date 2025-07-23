import mongoose from "mongoose";

const LecturerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subject: { type: String, required: true }, // ✅ Subjects taught by the lecturer
    collegeId: { type: String, required: true },
    role: { type: String, default: "lecturer" },
    photo: { type: String }, // ✅ Photo URL from Cloudinary or Base64
  },
  {
    timestamps: true, // optional: adds createdAt, updatedAt
  }
);

export default mongoose.models.Lecturer ||
  mongoose.model("Lecturer", LecturerSchema);
