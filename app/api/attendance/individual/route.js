// app/api/attendance/individual/route.js
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.collegeId) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const collegeId = new mongoose.Types.ObjectId(session.user.collegeId);
  const { searchParams } = new URL(req.url);

  const group = searchParams.get("group");
  const year = searchParams.get("year");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const sessionParam = searchParams.get("session"); // ⭐ NEW

  if (!group || !year) {
    return NextResponse.json({ data: [], message: "Missing group/year" }, { status: 400 });
  }

  const query = {
    collegeId,
    group,
    yearOfStudy: year,
  };

  if (start && end) {
    query.date = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  // ⭐ FILTER SESSION (FN / AN)
  if (sessionParam) {
    query.session = sessionParam;
  }

  try {
    const attendance = await Attendance.find(query)
      .populate("studentId", "name group yearOfStudy")
      .select("status date session");

    const formatted = attendance.map((a) => ({
      _id: a._id,
      student: a.studentId?.name || "Unknown",
      present: a.status === "Present" ? 1 : 0,
      absent: a.status === "Absent" ? 1 : 0,
      date: a.date,
      status: a.status,
      session: a.session,
      group: a.group,
      year: a.yearOfStudy,
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
