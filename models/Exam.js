// models/Exam.js
// This file defines the Mongoose schema and model for the Exam collection.
import mongoose from 'mongoose';
const { Schema } = mongoose;

const examSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  stream: {
    type: String,
    required: true,
    enum: ['MPC', 'BIPC', 'CEC', 'HEC', 'M&AT', 'CET', 'MLT'],
  },
  yearOfStudy: {
    type: String,
    required: true,
    enum: ["First Year", "Second Year"],
  },
  academicYear: {
    type: String,
    required: true,
    enum: ['2025-1', '2025-2'],
  },
  examType: {
    type: String,
    required: true,
    enum: ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4', 'QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2'],
  },
  examDate: {
    type: Date,
    default: Date.now,
  },
  generalSubjects: {
    type: Schema.Types.Mixed,
    required: function () {
      return ['MPC', 'BIPC', 'CEC', 'HEC'].includes(this.stream);
    },
  },
  vocationalSubjects: {
    type: Schema.Types.Mixed,
    required: function () {
      return ['M&AT', 'CET', 'MLT'].includes(this.stream);
    },
  },

  collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    
  total: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Exam;
