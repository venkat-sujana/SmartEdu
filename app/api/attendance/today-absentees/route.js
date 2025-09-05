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

    // ✅ Today date start & end
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    // ✅ ఈరోజు attendance తీసుకోవడం
    const todayRecords = await Attendance.find({
      collegeId,
      date: { $gte: start, $lte: end },
    }).populate("studentId", "name yearOfStudy group");

    if (todayRecords.length === 0) {
      return NextResponse.json({ status: "no-data", message: "No attendance recorded today" });
    }

    // ✅ Absentees మాత్రమే filter చేయడం
    const absentees = todayRecords.filter((r) => r.status === "Absent");

    // ✅ % calculation
    const total = todayRecords.length;
    const absentCount = absentees.length;
    const percentage = ((total - absentCount) / total) * 100;

    return NextResponse.json({
      status: "success",
      absentees: absentees.map((r) => ({
        name: r.studentId.name,
        yearOfStudy: r.studentId.yearOfStudy,
        group: r.studentId.group,
      })),
      percentage: percentage.toFixed(2),
    });
  } catch (err) {
    console.error("Error fetching today absentees:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
