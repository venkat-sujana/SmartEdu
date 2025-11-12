
//app/
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

    // Fetch today attendance (all sessions)
    const todayRecords = await Attendance.find({
      collegeId,
      date: { $gte: start, $lte: end },
    }).populate("studentId", "name yearOfStudy group");

    if (todayRecords.length === 0) {
      return NextResponse.json({ status: "no-data", message: "No attendance recorded today" });
    }

    // Group absentees by session
    const sessions = ["FN", "AN", "EN"];
    const sessionWiseAbsentees = {};
    const sessionWisePresent = {};
    let grandTotal = 0, grandAbsent = 0, grandPresent = 0;

    for (const session of sessions) {
      const absentees = todayRecords.filter((r) => r.session === session && r.status === "Absent");
      const presentStudents = todayRecords.filter((r) => r.session === session && r.status === "Present");
      const total = todayRecords.filter(r => r.session === session).length;

      sessionWiseAbsentees[session] = absentees.map((r) => ({
        name: r.studentId.name,
        yearOfStudy: r.studentId.yearOfStudy,
        group: r.studentId.group,
        session: r.session,
        lecturerName: r.lecturerName || "—"
      }));
      sessionWisePresent[session] = presentStudents.map((r) => ({
        name: r.studentId.name,
        yearOfStudy: r.studentId.yearOfStudy,
        group: r.studentId.group,
        session: r.session,
        lecturerName: r.lecturerName || "—"
      }));

      grandTotal += total;
      grandAbsent += absentees.length;
      grandPresent += presentStudents.length;
    }

    return NextResponse.json({
      status: "success",
      sessions: sessions,
      sessionWiseAbsentees,
      sessionWisePresent,
      summary: {
        grandTotal,
        grandAbsent,
        grandPresent,
        percentage: grandTotal > 0 ? ((grandPresent / grandTotal) * 100).toFixed(2) : "0.00"
      }
    });
  } catch (err) {
    console.error("Error fetching today absentees:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
