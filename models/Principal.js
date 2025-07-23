import mongoose from "mongoose";

const PrincipalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    collegeId: { type: String, required: true },
    role: { type: String, default: "principal" },
    photo: { type: String }, // ✅ Photo URL
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Principal ||
  mongoose.model("Principal", PrincipalSchema);
