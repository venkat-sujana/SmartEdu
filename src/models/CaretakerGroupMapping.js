import mongoose from "mongoose";

const caretakerGroupMappingSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },

    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },

    // Only explicitly assigned groups are stored here.
    // An empty array must never grant access to default groups.
    groups: {
      type: [String],
      default: [],
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

// Each lecturer has one mapping document per college.
caretakerGroupMappingSchema.index(
  { collegeId: 1, lecturerId: 1 },
  { unique: true }
);

const CaretakerGroupMapping =
  mongoose.models.CaretakerGroupMapping ||
  mongoose.model("CaretakerGroupMapping", caretakerGroupMappingSchema);

export default CaretakerGroupMapping;
