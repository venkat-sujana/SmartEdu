
import mongoose from "mongoose";

const lecturerUserMappingSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mappedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// One OSRA lecturer can map to only one Invigilation user.
lecturerUserMappingSchema.index(
  { lecturerId: 1 },
  { unique: true }
);

// One Invigilation user can map to only one OSRA lecturer.
lecturerUserMappingSchema.index(
  { userId: 1 },
  { unique: true }
);

const LecturerUserMapping =
  mongoose.models.LecturerUserMapping ||
  mongoose.model("LecturerUserMapping", lecturerUserMappingSchema);

export default LecturerUserMapping;
