// // app/api/attendance/individual/route.js
// import { NextResponse } from "next/server";
// import Attendance from "@/models/Attendance";
// import connectMongoDB from "@/lib/mongodb";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route"; // ✅ Adjust path if needed

// export async function GET(req) {
//   await connectMongoDB();

//   const session = await getServerSession(authOptions);

//   if (!session || !session.user?.collegeId) {
//     return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
//   }

//   const collegeId = session.user.collegeId;

//   const { searchParams } = new URL(req.url);
//   const group = searchParams.get("group");
//   const year = searchParams.get("year");
//   const start = searchParams.get("start");
//   const end = searchParams.get("end");

//   if (!group || !year) {
//     return NextResponse.json({ data: [], message: "Missing group/year" }, { status: 400 });
//   }

//   const query = {
//     collegeId,             // ✅ restrict to lecturer's college
//     group,
//     yearOfStudy: year,
//   };

//   if (start && end) {
//     query.date = {
//       $gte: new Date(start),
//       $lte: new Date(end),
//     };
//   }

//   try {
//     const attendance = await Attendance.find(query).populate("studentId", "name group yearOfStudy");

//     const formatted = attendance.map((a) => ({
//       _id: a._id,
//       student: a.studentId?.name || "Unknown",
//       present: a.status === "Present" ? 1 : 0,
//       absent: a.status === "Absent" ? 1 : 0,
//       date: a.date,
//       status: a.status,
//       group: a.group,
//       year: a.yearOfStudy
//     }));

//     return NextResponse.json({ data: formatted }, { status: 200 });
//   } catch (err) {
//     console.error("❌ API Error:", err);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust path if needed
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

  try {
    const attendance = await Attendance.find(query)
      .populate("studentId", "name group yearOfStudy")
      .select("status date session"); // important to select session field

    const formatted = attendance.map((a) => ({
      _id: a._id,
      student: a.studentId?.name || "Unknown",
      present: a.status === "Present" ? 1 : 0,
      absent: a.status === "Absent" ? 1 : 0,
      date: a.date,
      status: a.status,
      session: a.session || "N/A",  // Session info added here
      group: a.group,
      year: a.yearOfStudy,
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
