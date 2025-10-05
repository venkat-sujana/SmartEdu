


// app/api/attendance/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // adjust path if needed


// 🔽 POST Attendance
export async function POST(req) {
  await connectMongoDB();

  try {
    
    const session = await getServerSession(authOptions);


    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }



    const collegeId = session.user.collegeId;
   const lecturerName = session.user.name || "Unknown Lecturer";
const lecturerId = session.user.id || session.user._id || null;


    const records = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ message: "Invalid data", status: "error" }, { status: 400 });
    }

    
   
    // ✅ Extract common info (same for all students in this batch)
    const { date, year, group } = records[0];

    
    // 🔥 Step 1: Duplicate check (same date + year + group + collegeId)
    const duplicate = await Attendance.findOne({
      date,
      year,
      group,
      collegeId,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          status: "error",
          message: `Attendance already taken for ${year} year - ${group} group on ${new Date(date).toDateString()}`,
        },
        { status: 400 }
      );
    }
let students = [];
let processedRecords = [];


    // ✅ Step 2: Process valid student records

     processedRecords = [];

    for (let record of records) {
      // 👉 Student check
      const student = await mongoose.model("Student").findOne({
        _id: record.studentId,
        collegeId: collegeId,
      }).lean();

      if (!student) continue;

      const joinDate = student.dateOfJoining ? new Date(student.dateOfJoining) : null;
      const attendanceDate = new Date(record.date);

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
        lecturerName,// 🔥 New fields
        lecturerId, // 🔥 New fields
      });
    }

    console.log("SESSION USER:", session.user);


    if (processedRecords.length === 0) {
      return NextResponse.json({ message: "No valid attendance records to save", status: "error" });
    }


    // ✅ Step 3: Bulk upsert attendance records
     // 🔥 Step 3: Save attendance
    // 🔥 insertMany బదులు bulkWrite వాడుతున్నాం
    const bulkOps = processedRecords.map((rec) => ({
      updateOne: {
        filter: { studentId: rec.studentId, date: rec.date },
        update: { $set: rec },
        upsert: true, // కొత్తదైతే insert అవుతుంది
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    return NextResponse.json({ message: "Attendance submitted successfully", status: "success" });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ message: "Error submitting attendance", status: "error" }, { status: 500 });
  }
}




// 🔽 GET Attendance Record + Summary
export async function GET(req) {
  await connectMongoDB();
  console.log("📢 Attendance GET API called");

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const filter = { collegeId };
    if (month) filter.month = month;
    if (year) filter.year = Number(year);

    const records = await Attendance.find(filter);

    // ✅ Summary calc
    const total = records.length;
    const presents = records.filter((r) => r.status === "Present").length;
    const percentage = total > 0 ? ((presents / total) * 100).toFixed(2) : 0;

    return NextResponse.json({
      status: "success",
      totalRecords: total,
      totalPresents: presents,
      attendancePercentage: percentage,
      data: records, // optional: full data కూడా ఇస్తున్నాం
    });
  } catch (err) {
    console.error("💥 GET Error:", err);
    return NextResponse.json({ message: "Error fetching attendance", status: "error" }, { status: 500 });
  }
}


