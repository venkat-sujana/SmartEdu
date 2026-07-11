import mongoose from 'mongoose'

const SystemSettingsSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      unique: true,
    },

    modules: {
      // ==========================
      // Fee Module
      // ==========================
      fee: {
        enabled: {
          type: Boolean,
          default: true,
        },
        mode: {
          type: String,
          enum: ['automatic', 'manual'],
          default: 'automatic',
        },
        startDate: {
          type: String,
          default: '',
        },
        endDate: {
          type: String,
          default: '',
        },
      },

      // ==========================
      // Admissions Module
      // ==========================
      admissions: {
        enabled: {
          type: Boolean,
          default: true,
        },
        mode: {
          type: String,
          enum: ['automatic', 'manual'],
          default: 'automatic',
        },
        startDate: {
          type: String,
          default: '',
        },
        endDate: {
          type: String,
          default: '',
        },
      },

      // ==========================
      // Attendance Module
      // ==========================
      attendance: {
        enabled: {
          type: Boolean,
          default: true,
        },
      },

      // ==========================
      // Exams Module
      // ==========================
      exams: {
        enabled: {
          type: Boolean,
          default: true,
        },
      },

      // ==========================
      // Timetable Module
      // ==========================
      timetable: {
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.SystemSettings ||
  mongoose.model('SystemSettings', SystemSettingsSchema)