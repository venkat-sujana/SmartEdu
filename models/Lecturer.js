// models/Lecturer.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const lecturerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  subject: {
    type: String,
  },
  assignedGroups: {
    type: [String], // Example: ["MPC", "HEC"]
    default: [],
  },
  assignedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "lecturer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password encryption before saving
lecturerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method
lecturerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Lecturer = mongoose.models.Lecturer || mongoose.model("Lecturer", lecturerSchema);
export default Lecturer;
