import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

export async function GET(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");

  if (!group) return NextResponse.json({ error: "Missing group" });

  try {
    const students = await Student.find({ group }).select("_id name");

    const months = [
      
      { label: "JUN", key: "June" },
      { label: "JUL", key: "July" },
      { label: "AUG", key: "August" },
      { label: "SEP", key: "September" },
      { label: "OCT", key: "October" },
      { label: "NOV", key: "November" },
      { label: "DEC", key: "December" },
      { label: "JAN", key: "January" },
      { label: "FEB", key: "February" },
      { label: "MAR", key: "March" },
    ];

    const studentIds = students.map((s) => s._id);

    const attendance = await Attendance.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: {
            studentId: "$studentId",
            month: "$month",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = students.map((student) => {
      const studentData = {
        name: student.name,
        present: {},
        workingDays: {},
      };

      months.forEach((month) => {
        const presentCount =
          attendance.find(
            (r) =>
              r._id.studentId.toString() === student._id.toString() &&
              r._id.month === month.key &&
              r._id.status === "Present"
          )?.count || 0;

        const absentCount =
          attendance.find(
            (r) =>
              r._id.studentId.toString() === student._id.toString() &&
              r._id.month === month.key &&
              r._id.status === "Absent"
          )?.count || 0;

        const working = presentCount + absentCount;

        studentData.present[month.label] = presentCount;
        studentData.workingDays[month.label] = working;
      });

      return studentData;
    });

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("Error generating monthly summary:", error);
    return NextResponse.json({ error: "Failed to generate summary" });
  }
}
