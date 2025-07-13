// app/api/attendance/monthly-summary/[id]/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

const monthNameMap = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December"
};

export async function GET(req) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.collegeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collegeId = session.user.collegeId;
  const { searchParams } = new URL(req.url);
  const yearOfStudy = searchParams.get("yearOfStudy");

  console.log("📊 Fetching summary for College ID:", collegeId, "Year:", yearOfStudy);

  try {
    const summary = await Attendance.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      {
        $match: {
          "studentInfo.collegeId": new mongoose.Types.ObjectId(collegeId),
          ...(yearOfStudy && { "studentInfo.yearOfStudy": yearOfStudy })
        }
      },
      {
        $addFields: {
          month: { $dateToString: { format: "%m", date: "$date" } },
          year: { $dateToString: { format: "%Y", date: "$date" } }
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
      const monthName = monthNameMap[item._id.month] || item._id.month;
      const key = `${monthName}-${item._id.year}`;
      formatted[key] = {
        total: item.total,
        present: item.present
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ Aggregation error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}