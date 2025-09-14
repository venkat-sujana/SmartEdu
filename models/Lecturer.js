//app/models/Lecturer.js

import mongoose from 'mongoose'
const lecturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College ID is required'],
    },
    subject: {
      type: String,
      enum: {
        values: [
          'Maths',
          'Physics',
          'English',
          'Telugu',
          'Hindi',
          'Civics',
          'Zoology',
          'Botany',
          'Chemistry',
          'CET',
          'MLT',
          'Economics',
          'History',
          'Commerce',
          'MandAT',
        ],
        message:
          'Subject must be one of: Maths, Physics, English, Telugu, Hindi, Civics, Zoology, Botany, Chemistry, CET, MLT, Economics, History, Commerce, MandAT',
      },
      required: [true, 'Subject is required'],
    },

    collegeName: {
      type: String,
      required: true,
    },
     photo: { type: String, default: "" },
  },

  {
    timestamps: true,
    // Add indexes for better performance
    indexes: [
      { email: 1 }, // Single field index
      { collegeId: 1, subject: 1 }, // Compound index
    ],
  }
)

// Add instance methods
lecturerSchema.methods.toJSON = function () {
  const lecturer = this.toObject()
  delete lecturer.password // Don't return password in JSON
  return lecturer
}

// ✅ Safe model creation with proper error handling
const Lecturer = mongoose.models?.Lecturer || mongoose.model('Lecturer', lecturerSchema)

export default Lecturer
