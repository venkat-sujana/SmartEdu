import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

export async function GET(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const group = decodeURIComponent(searchParams.get("group"));
  const start = searchParams.get("start");
  const end = searchParams.get("end");



  if (!group) return NextResponse.json({ error: "Missing group" });

  try {
    const students = await Student.find({ group }).select("_id name");

    const studentIds = students.map((s) => s._id);

    const match = { studentId: { $in: studentIds } };
    if (start && end) {
      match.date = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const records = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { studentId: "$studentId", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = students.map((s) => {
      const studentRecords = records.filter((r) => r._id.studentId.toString() === s._id.toString());
      const present = studentRecords.find((r) => r._id.status === "Present")?.count || 0;
      const absent = studentRecords.find((r) => r._id.status === "Absent")?.count || 0;
      const total = present + absent;
      const percentage = total > 0 ? (present / total) * 100 : 0;

      return {
        student: s.name,
        present,
        absent,
        total,
        percentage,
      };
    });

    return NextResponse.json({ data: summary });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to fetch group-wise individual data" });
  }
}
