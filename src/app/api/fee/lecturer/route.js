import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Fee from "@/models/Fee";
import mongoose from "mongoose";

export async function GET(req) {
  await connectMongoDB();

  try {
    const { searchParams } = new URL(req.url);

    const collegeId = searchParams.get("collegeId");
    const group = searchParams.get("group");

    if (!collegeId || !group) {
      return NextResponse.json(
        { error: "collegeId and group are required" },
        { status: 400 }
      );
    }

    // Students
    const students = await Student.find({
      collegeId: new mongoose.Types.ObjectId(collegeId),
      group,
    })
      .select("name admissionNo group yearOfStudy")
      .sort({ name: 1 })
      .lean();

    // Fee Records
    const feeRecords = await Fee.find({
      collegeId: new mongoose.Types.ObjectId(collegeId),
    })
      .select("studentId totalFee payments status")
      .lean();

    // Merge Students + Fee Records
    const data = students.map((student) => {
      const fee = feeRecords.find(
        (f) => f.studentId.toString() === student._id.toString()
      );

      const totalPaid = fee
        ? fee.payments.reduce((sum, p) => sum + p.amount, 0)
        : 0;

      return {
        _id: student._id,
        name: student.name,
        admissionNo: student.admissionNo,
        group: student.group,
        yearOfStudy: student.yearOfStudy,

        status: fee ? fee.status : "Pending",

        totalFee: fee?.totalFee || 0,
        totalPaid,
        balance: fee ? fee.totalFee - totalPaid : 0,

        feeId: fee?._id || null,
      };
    });

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error("Lecturer Fee API Error:", error);

    return NextResponse.json(
      {
        error: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}