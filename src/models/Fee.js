import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
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

    academicYear: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}-\d{4}$/, "Format: 2024-2025"],
    },

    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },

    payments: [
      {
        amount: { type: Number, required: true, min: 1 },
        paidDate: { type: Date, required: true, default: Date.now },
        note: { type: String, trim: true, default: "" },
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    status: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true }
);

// One fee record per student per academic year
feeSchema.index(
  { studentId: 1, academicYear: 1 },
  { unique: true }
);

feeSchema.index({ collegeId: 1, academicYear: 1, status: 1 });

// Auto-compute status before save
feeSchema.pre("save", function (next) {
  const totalPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);
  if (totalPaid <= 0) this.status = "Pending";
  else if (totalPaid >= this.totalFee) this.status = "Paid";
  else this.status = "Partial";
  next();
});

export default mongoose.models.Fee || mongoose.model("Fee", feeSchema);