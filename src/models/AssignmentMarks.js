import mongoose from "mongoose";

const assignmentMarksSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    yearOfStudy: {
      type: String,
      required: true,
      enum: ["First Year", "Second Year"],
      index: true,
    },

    group: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    assignment1: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment2: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment3: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment4: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment5: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment6: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment7: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment8: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment9: {
      type: Number,
      min: 0,
      default: null,
    },

    assignment10: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * One marks record per student
 * for each subject and academic context.
 */
assignmentMarksSchema.index(
  {
    collegeId: 1,
    academicYear: 1,
    yearOfStudy: 1,
    group: 1,
    subject: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.AssignmentMarks ||
  mongoose.model("AssignmentMarks", assignmentMarksSchema);