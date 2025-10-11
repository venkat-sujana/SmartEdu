// models/Principal.js
import mongoose from "mongoose";

const PrincipalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    role: { type: String, enum: ["principal"], default: "principal" },
    photo: { type: String, default: "" },
    dateOfJoining: { type: Date, default: Date.now }, // ✅ Added
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Principal || mongoose.model("Principal", PrincipalSchema);
