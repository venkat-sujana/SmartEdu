// app/api/attendance/monthly-summary/[id]/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose"; // ✅ VERY IMPORTANT!

export async function GET(req, { params }) {
  await connectMongoDB();

  const { id } = params;
  console.log("Fetching monthly summary for student ID:", id);

  try {
    const summary = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const formatted = {};
    summary.forEach(item => {
      const key = `${item._id.month}-${item._id.year}`;
      formatted[key] = {
        total: item.total,
        present: item.present
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Aggregation error:", error); // ✅ This will now show actual issue
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
