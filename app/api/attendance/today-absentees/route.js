
//app/api/attendance/today-absentees/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;

    // Today date range
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    // ఈరోజు attendance తీసుకోవడం
    const todayRecords = await Attendance.find({
      collegeId,
      date: { $gte: start, $lte: end },
    }).populate("studentId", "name yearOfStudy group");

    if (todayRecords.length === 0) {
      return NextResponse.json({ status: "no-data", message: "No attendance recorded today" });
    }

    // Absentees and Present students filter
    const absentees = todayRecords.filter((r) => r.status === "Absent");
    const presentStudents = todayRecords.filter((r) => r.status === "Present");

    // % calculation
    const total = todayRecords.length;
    const absentCount = absentees.length;
    const presentCount = presentStudents.length;
    const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(2) : "0.00";

    return NextResponse.json({
      status: "success",
      absentees: absentees.map((r) => ({
        name: r.studentId.name,
        yearOfStudy: r.studentId.yearOfStudy,
        group: r.studentId.group,
      })),
      presentStudents: presentStudents.map((r) => ({
        name: r.studentId.name,
        yearOfStudy: r.studentId.yearOfStudy,
        group: r.studentId.group,
      })),
      percentage,
      total,
      present: presentCount,
      absent: absentCount,
    });
  } catch (err) {
    console.error("Error fetching today absentees:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
