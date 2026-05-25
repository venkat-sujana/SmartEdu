import mongoose from "mongoose";

const lecturerAvailabilitySchema =
  new mongoose.Schema(
    {
      lecturerId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      date: {
        type: Date,
        required: true,
      },

      session: {
        type: String,

        enum: [
          "FN",
          "AN",
          "EN",
          "FULLDAY",
        ],

        required: true,
      },

      status: {
        type: String,

        enum: [
          "AVAILABLE",
          "NOT_AVAILABLE",
        ],

        default: "NOT_AVAILABLE",
      },

      reason: {
        type: String,
        trim: true,
        default: "",
      },

      collegeId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "College",

        index: true,
      },

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },
    },

    {
      timestamps: true,
    }
  );

lecturerAvailabilitySchema.index(
  {
    lecturerId: 1,
    date: 1,
    session: 1,
  },

  {
    unique: true,
  }
);

export default
  mongoose.models
    .LecturerAvailability ||

  mongoose.model(
    "LecturerAvailability",
    lecturerAvailabilitySchema
  );