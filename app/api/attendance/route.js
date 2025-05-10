import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';

export async function POST(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    console.log("Received body:", body); // ✅ Add this

    const { date, records } = body;

    const newAttendance = new Attendance({ date, records });
    await newAttendance.save();

    return NextResponse.json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error("Error saving attendance:", error); // ✅ Already exists
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
export async function GET() {
  try {
    await connectMongoDB();

    const records = await Attendance.find().sort({ date: -1 }).lean();

    if (!records.length) {
      return NextResponse.json({ records: [] });
    }

    // Collect all unique student IDs from attendance records
    const allStudentIds = new Set();
    records.forEach((rec) => {
      Object.keys(rec.records).forEach((id) => allStudentIds.add(id));
    });

    // Get student names
    const students = await Student.find({
      _id: { $in: Array.from(allStudentIds) },
    }).lean();

    const studentMap = {};
    students.forEach((s) => {
      studentMap[s._id.toString()] = s.name;
    });

    // Replace student IDs with names in records
    const enrichedRecords = records.map((rec) => {
      const converted = {};
      Object.entries(rec.records).forEach(([id, status]) => {
        const name = studentMap[id] || id;
        converted[name] = status;
      });
      return {
        date: rec.date,
        records: converted,
      };
    });

    return NextResponse.json({ records: enrichedRecords });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}