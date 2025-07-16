// models/Lecturer.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const lecturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  subject: { type: String, required: true },
  assignedGroups: { type: [String], default: [] },
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  password: { type: String, required: true },
  photo: { type: String, default: "" },
  role: { type: String, default: "lecturer" },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true
  },
  collegeName: String, // ✅ This should exist
  createdAt: { type: Date, default: Date.now },
});

// 🔐 Hash password before saving
lecturerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔍 Compare password
lecturerSchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

export default mongoose.models.Lecturer || mongoose.model("Lecturer", lecturerSchema);
