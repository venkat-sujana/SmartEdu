import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Student
    // --------------------------------------------------

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },

    // Useful for lecturer/group filtering
    group: {
      type: String,
      required: true,
      trim: true,
    },

    yearOfStudy: {
      type: String,
      required: true,
      trim: true,
    },

    // --------------------------------------------------
    // Leave details
    // --------------------------------------------------

    leaveDate: {
      type: Date,
      required: true,
      index: true,
    },

    session: {
      type: String,
      enum: ["FN", "AN", "Full Day"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // --------------------------------------------------
    // Request status
    // --------------------------------------------------

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    // --------------------------------------------------
    // Lecturer action
    // --------------------------------------------------

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    lecturerRemark: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------------------------
// Prevent duplicate active/pending leave requests
// for same student + date + session
// ------------------------------------------------------

LeaveRequestSchema.index(
  {
    studentId: 1,
    leaveDate: 1,
    session: 1,
  },
  {
    unique: true,
  }
);

const LeaveRequest =
  mongoose.models.LeaveRequest ||
  mongoose.model("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;