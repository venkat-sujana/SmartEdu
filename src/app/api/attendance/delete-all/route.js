// app/api/attendance/delete-all/route.js
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function DELETE(req) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");
  const year = searchParams.get("year");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!group || !year) {
    return NextResponse.json(
      { message: "Group and Year అవసరం" },
      { status: 400 }
    );
  }

  const collegeId = new mongoose.Types.ObjectId(session.user.collegeId);

  const query = { collegeId, group, yearOfStudy: year };

  // ✅ Date range filter — IST timezone
  if (start && end) {
    query.date = {
      $gte: new Date(`${start}T00:00:00+05:30`),
      $lte: new Date(`${end}T23:59:59+05:30`),
    };
  }

  try {
    const result = await Attendance.deleteMany(query);
    console.log(`🗑️ Deleted ${result.deletedCount} records`);

    return NextResponse.json({
      message: `${result.deletedCount} records deleted successfully`,
      deletedCount: result.deletedCount,
      status: "success",
    });
  } catch (err) {
    console.error("Delete All Error:", err);
    return NextResponse.json(
      { message: "Error deleting records" },
      { status: 500 }
    );
  }
}