// models/Exam.js
// This file defines the Mongoose schema and model for the Exam collection.
import mongoose from 'mongoose';
import { STREAMS, computePercentage } from '@/validations/examValidation';
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
    enum: STREAMS,
  },
  yearOfStudy: {
    type: String,
    required: true,
    enum: ["First Year", "Second Year"],
  },
  academicYear: {
    type: String,
    required: true,
    match: [/^\d{4}-(1|2)$/, "Invalid academic year format"],
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
  generalSubjects: [{
    subject: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    maxMarks: { type: Number, default: 100, min: 1 }
  }],
  vocationalSubjects: [{
    subject: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    maxMarks: { type: Number, default: 100, min: 1 }
  }],

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
  timestamps: true
});

examSchema.pre('validate', function(next) {
  const general = this.generalSubjects || [];
  const vocational = this.vocationalSubjects || [];
  let subjects;
  
  if (STREAMS.slice(0,4).includes(this.stream)) {
    subjects = general;
  } else if (STREAMS.slice(4).includes(this.stream)) {
    subjects = vocational;
  } else {
    return next(new Error('Invalid stream'));
  }
  
  if (subjects.length === 0) {
    return next(new Error('Subjects required for the stream'));
  }
  
  this.total = subjects.reduce((sum, s) => sum + (s.marks || 0), 0);
  this.percentage = computePercentage(subjects);
  next();
});

examSchema.index({ studentId: 1, examType: 1, academicYear: 1 });
examSchema.index({ collegeId: 1, academicYear: 1, examType: 1 });

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Exam;
