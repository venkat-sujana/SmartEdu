//src/app/api/fee/admin/[id]/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Fee from "@/models/Fee";
import mongoose from "mongoose";

// PUT — Fee record update
export async function PUT(req, context) {
  await connectMongoDB();
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { totalFee, academicYear, amount, note } = body;

    const feeRecord = await Fee.findById(id);
    if (!feeRecord) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
    }

    if (totalFee)     feeRecord.totalFee     = Number(totalFee);
    if (academicYear) feeRecord.academicYear = academicYear;

    if (amount && typeof Number(amount) === "number" && Number(amount) > 0) {
      const totalPaidSoFar = feeRecord.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaidSoFar + Number(amount) > feeRecord.totalFee) {
        return NextResponse.json(
          { error: `Payment exceeds total fee. Max: ₹${feeRecord.totalFee - totalPaidSoFar}` },
          { status: 400 }
        );
      }
      feeRecord.payments.push({
        amount:   Number(amount),
        paidDate: new Date(),
        note:     note || "",
      });
    }

    await feeRecord.save();
    return NextResponse.json({ message: "Fee updated successfully", data: feeRecord });
  } catch (err) {
    console.error("Fee PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — Fee record delete by ID
export async function DELETE(req, context) {
  await connectMongoDB();
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await Fee.findByIdAndDelete(id);
    return NextResponse.json({ message: "Fee record deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}