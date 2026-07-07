//src/app/api/fee/student/[studentId]/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Fee from "@/models/Fee";
import mongoose from "mongoose";

export async function GET(req, context) {
  await connectMongoDB();

  const { studentId } = await context.params;

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
  }

  try {
    // Latest academic year record first
    const feeRecords = await Fee.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .sort({ academicYear: -1 })
      .lean();

    if (!feeRecords || feeRecords.length === 0) {
      return NextResponse.json({ data: [], status: "success" });
    }

    const formatted = feeRecords.map((record) => {
      const totalPaid = record.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance   = record.totalFee - totalPaid;

      return {
        _id:          record._id,
        academicYear: record.academicYear,
        totalFee:     record.totalFee,
        totalPaid,
        balance:      balance > 0 ? balance : 0,
        status:       record.status,
        payments:     record.payments.map((p) => ({
          amount:   p.amount,
          paidDate: p.paidDate,
          note:     p.note || "",
        })),
      };
    });

    return NextResponse.json({ data: formatted, status: "success" });
  } catch (err) {
    console.error("Fee fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}