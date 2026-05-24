import mongoose from "mongoose";

const invigilationRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    block: { type: String, trim: true, default: "" },
    capacity: { type: Number, min: 1 },
    isActive: { type: Boolean, default: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

invigilationRoomSchema.index({ collegeId: 1, name: 1 }, { unique: true, sparse: true });

export default mongoose.models.InvigilationRoom ||
  mongoose.model("InvigilationRoom", invigilationRoomSchema);
