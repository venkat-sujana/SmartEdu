//src/models/LecturerAvailability.js

import mongoose from 'mongoose'

const LecturerAvailabilitySchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    session: {
      type: String,
      enum: ['FN', 'AN', 'EN'],
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      required: true,
      default: 'available',
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
)

// One record per lecturer per date per session
LecturerAvailabilitySchema.index({ lecturerId: 1, date: 1, session: 1 }, { unique: true })

export default mongoose.models.LecturerAvailability ||
  mongoose.model('LecturerAvailability', LecturerAvailabilitySchema)
