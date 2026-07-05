import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

export async function GET(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.collegeId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");
    const yearOfStudy = searchParams.get("yearOfStudy");
    const month = parseInt(searchParams.get("month"));
    const year = parseInt(searchParams.get("year"));

    if (!group || !yearOfStudy || !month || !year) {
      return NextResponse.json(
        { status: "error", message: "Missing params" },
        { status: 400 }
      );
    }

    const normalizedGroup = normalizeAttendanceGroup(group);

    // ఆ class లో అందరు students
    const studentsList = await Student.find({
      collegeId: session.user.collegeId,
      group: normalizedGroup,
      yearOfStudy,
    })
      .sort({ admissionNo: 1 })
      .lean();

    if (!studentsList.length) {
      return NextResponse.json({ status: "success", data: [] });
    }

    // ఆ month లో attendance records
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const attendanceRecords = await Attendance.find({
      collegeId: session.user.collegeId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    // Student wise summary తయారు చేయి
    const data = studentsList.map((student) => {
      const studentRecords = attendanceRecords.filter(
        (r) => r.studentId?.toString() === student._id?.toString()
      );

      const present = studentRecords.filter(
        (r) => r.status === "Present"
      ).length;
      const absent = studentRecords.filter(
        (r) => r.status === "Absent"
      ).length;
      const working = present + absent;
      const percentage =
        working > 0 ? ((present / working) * 100).toFixed(1) : "0.0";

      return {
        admissionNo: student.admissionNo || "-",
        name: student.name || "-",
        present,
        absent,
        working,
        percentage,
      };
    });

    return NextResponse.json({ status: "success", data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { status: "error", message: "Server Error" },
      { status: 500 }
    );
  }
}