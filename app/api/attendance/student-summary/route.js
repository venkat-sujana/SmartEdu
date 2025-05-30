
// This route handles fetching the attendance summary for a specific student
// based on their studentId.
// It aggregates attendance data by month and status (Present/Absent),
// returning a summary of present and working days for each month.
// It uses MongoDB aggregation to group attendance records and calculate the summary.


//api/attendance/student-summary/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) return NextResponse.json({ error: "Missing studentId" });

  try {
    const months = [
      "June", "July", "August", "September", "October", "November",
      "December", "January", "February", "March"
    ];

    const attendance = await Attendance.aggregate([
      { $match: { studentId: { $eq: new mongoose.Types.ObjectId(studentId) } } },
      {
        $group: {
          _id: { month: "$month", status: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {};
    months.forEach((m) => {
      const present = attendance.find(a => a._id.month === m && a._id.status === "Present")?.count || 0;
      const absent = attendance.find(a => a._id.month === m && a._id.status === "Absent")?.count || 0;
      summary[m] = {
        present,
        workingDays: present + absent
      };
    });

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("Student attendance summary error:", error);
    return NextResponse.json({ error: "Something went wrong" });
  }
}
