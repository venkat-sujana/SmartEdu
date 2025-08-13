// app/api/attendance/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // adjust path if needed

// 🔽 POST Attendance
// 🔽 POST Attendance
export async function POST(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    const records = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ message: "Invalid data", status: "error" }, { status: 400 });
    }

    // 🆕 ప్రతి స్టూడెంట్ యొక్క joining date తీసుకొని filter చేయడం
    const processedRecords = [];
    for (let record of records) {
      const student = await mongoose.model("Student").findById(record.studentId).lean();
      if (!student) continue;

      const joinDate = student.dateOfJoining ? new Date(student.dateOfJoining) : null;
      const attendanceDate = new Date(record.date);

      // joinDate ఉందే && attendanceDate < joinDate అయితే స్కిప్ చేయాలి
      if (joinDate && attendanceDate < joinDate) {
        continue;
      }

      const month = attendanceDate.toLocaleString("default", { month: "long" });
      const year = attendanceDate.getFullYear();

      processedRecords.push({
        ...record,
        collegeId,
        month,
        year,
      });
    }

    if (processedRecords.length === 0) {
      return NextResponse.json({ message: "No valid attendance records to save", status: "error" });
    }

    await Attendance.insertMany(processedRecords);

    return NextResponse.json({ message: "Attendance submitted", status: "success" });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ message: "Error submitting attendance", status: "error" }, { status: 500 });
  }
}


// 🔽 GET Attendance Record
// app/api/attendance/route.js
export async function GET(req) {
  await connectMongoDB();
  console.log("📢 Attendance GET API called");

  try {
    const session = await getServerSession(authOptions);
    console.log("✅ Session data:", session);

    if (!session || !session.user?.collegeId) {
      console.log("❌ Unauthorized: No session or collegeId");
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    console.log("🏫 College ID:", collegeId);

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const group = searchParams.get("group");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    console.log("📅 Query params =>", { date, group, month, year });

    const filter = { collegeId };
    if (date) filter.date = new Date(date);
    if (group) filter.group = group;
    if (month) filter.month = month;
    if (year) filter.year = Number(year);

    console.log("🔍 MongoDB filter =>", filter);

    const records = await Attendance.find(filter)
      .populate("studentId", "name group dateOfJoining")
      .sort({ date: -1 });

    console.log("📊 Raw Attendance records:", records);

    // ✅ Join date check
    const updatedRecords = records.map((rec) => {
      const joinDate = new Date(rec.studentId.dateOfJoining);
      if (rec.date < joinDate) {
        return { ...rec.toObject(), status: "-" };
      }
      return rec;
    });

    console.log("✅ Final processed records:", updatedRecords);

    return NextResponse.json({ data: updatedRecords, status: "success" });
  } catch (err) {
    console.error("💥 GET Error:", err);
    return NextResponse.json({ message: "Error fetching attendance", status: "error" }, { status: 500 });
  }
}

