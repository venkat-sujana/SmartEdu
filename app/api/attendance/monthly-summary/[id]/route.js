
// app/api/attendance/monthly-summary/[id]/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  await connectMongoDB();
  const { id } = params;

  const { searchParams } = new URL(req.url);
  const yearOfStudy = searchParams.get("yearOfStudy"); // 👈 get yearOfStudy from query

  console.log("Fetching monthly summary for student ID:", id, "Year:", yearOfStudy);

  try {
    const summary = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      // 👇 Apply yearOfStudy filter if provided
      ...(yearOfStudy
        ? [
            {
              $match: {
                "studentInfo.yearOfStudy": yearOfStudy
              }
            }
          ]
        : []),
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
    console.error("Aggregation error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
