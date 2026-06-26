//src/models/OfficeStaff.js
import mongoose from 'mongoose'

const officeStaffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      enum: [
        'Senior Assistant',
        'Record Assistant',
        'Office Superintendent',
        'Junior Assistant',
        'Data Entry Operator',
        'Office Subordinate',
      ],
      required: true,
    },

    photo: {
      type: String,
      default: '',
    },

    mobile: {
      type: String,
      default: '',
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.OfficeStaff || mongoose.model('OfficeStaff', officeStaffSchema)
