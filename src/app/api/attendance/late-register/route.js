//src/app/api/attendance/late-register/route.js
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.collegeId) {
    return NextResponse.json(
      { status: "error" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query = {
    collegeId: session.user.collegeId,
    lateComer: true,
  };

  if (from && to) {
    query.date = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  const records = await Attendance.find(query)
    .populate("studentId")
    .sort({ date: -1 });

  const data = records.map((r) => ({
    date: r.date,
    admissionNo: r.studentId?.admissionNo,
    studentName: r.studentId?.name,
    group: r.group,
    year: r.yearOfStudy,
    status: r.status,
    lateTime: r.lateTime,
    lecturer: r.lecturerName,
  }));

  return NextResponse.json({
    status: "success",
    data,
  });
}