//src/app/api/fee/admin/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Fee from "@/models/Fee";
import mongoose from "mongoose";

// POST — Fee record create చేయడం లేదా payment add చేయడం
export async function POST(req) {
  await connectMongoDB();

  try {
    const body = await req.json();
    const { studentId, collegeId, academicYear, totalFee, amount, note } = body;

    if (!studentId || !collegeId || !academicYear || !totalFee) {
      return NextResponse.json(
        { error: "studentId, collegeId, academicYear, totalFee అన్నీ అవసరం" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
    }

    if (!/^\d{4}-\d{4}$/.test(academicYear)) {
      return NextResponse.json(
        { error: "academicYear format: 2024-2025" },
        { status: 400 }
      );
    }

    if (typeof totalFee !== "number" || totalFee <= 0) {
      return NextResponse.json(
        { error: "totalFee positive number అయి ఉండాలి" },
        { status: 400 }
      );
    }

    // Existing record find చేయడం లేదా create చేయడం
    let feeRecord = await Fee.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      academicYear,
    });

    if (!feeRecord) {
      feeRecord = new Fee({
        studentId:    new mongoose.Types.ObjectId(studentId),
        collegeId:    new mongoose.Types.ObjectId(collegeId),
        academicYear,
        totalFee,
        payments:     [],
      });
    } else {
      feeRecord.totalFee = totalFee;
    }

    // Payment add చేయడం
    if (amount && typeof amount === "number" && amount > 0) {
      const totalPaidSoFar = feeRecord.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaidSoFar + amount > totalFee) {
        return NextResponse.json(
          { error: `Payment exceeds total fee. Max payable: ₹${totalFee - totalPaidSoFar}` },
          { status: 400 }
        );
      }
      feeRecord.payments.push({
        amount,
        paidDate:   new Date(),
        note:       note || "",
      });
    }

    await feeRecord.save();

    return NextResponse.json(
      { message: "Fee record saved successfully", data: feeRecord },
      { status: 200 }
    );
  } catch (err) {
    console.error("Fee admin POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET — Admin panel list కోసం (student populate తో)
export async function GET(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const collegeId     = searchParams.get("collegeId");
  const academicYear  = searchParams.get("academicYear");
  const search        = searchParams.get("search") || "";
  const page          = parseInt(searchParams.get("page")  || "1",  10);
  const limit         = parseInt(searchParams.get("limit") || "10", 10);
  const skip          = (page - 1) * limit;

  if (!collegeId) {
    return NextResponse.json(
      { error: "collegeId required" },
      { status: 400 }
    );
  }

  try {
    const filter = {
      collegeId: new mongoose.Types.ObjectId(collegeId),
    };
    if (academicYear) filter.academicYear = academicYear;

    const [records, total] = await Promise.all([
      Fee.find(filter)
       .populate({
  path: "studentId",
  select: "name admissionNo group yearOfStudy collegeId",
  populate: {
    path: "collegeId",
    select: "name",
  },
})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Fee.countDocuments(filter),
    ]);

    // Search filter (student name లేదా admissionNo)
    const filtered = search
      ? records.filter(r =>
          r.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.studentId?.admissionNo?.toLowerCase().includes(search.toLowerCase())
        )
      : records;

    const formatted = filtered.map((r) => {
      const totalPaid = r.payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        _id:          r._id,
        studentId:    r.studentId,
        academicYear: r.academicYear,
        totalFee:     r.totalFee,
        totalPaid,
        balance:      r.totalFee - totalPaid > 0 ? r.totalFee - totalPaid : 0,
        status:       r.status,
        paymentCount: r.payments.length,
      };
    });

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      status: "success",
    });
  } catch (err) {
    console.error("Fee admin GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — Fee record delete
export async function DELETE(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await Fee.findByIdAndDelete(id);
    return NextResponse.json({ message: "Fee record deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}