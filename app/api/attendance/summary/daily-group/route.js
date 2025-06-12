import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

export async function GET(req) {
  await connectMongoDB();

const { searchParams } = new URL(req.url);
const start = searchParams.get("start");
const end = searchParams.get("end");
const group = searchParams.get("group");
const year = searchParams.get("yearOfStudy"); // 👈 add this


  const yearOptions = ["First Year", "Second Year"];

  try {
    const results = {};

    for (const yearOfStudy of yearOptions) {
      const matchStage = {};

      if (start && end) {
        matchStage.date = {
          $gte: new Date(start),
          $lte: new Date(end),
        };
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        matchStage.date = { $gte: today, $lt: tomorrow };
      }

      if (group) matchStage.group = group;

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "studentInfo",
          },
        },
        { $unwind: "$studentInfo" },
        {
          $match: {
            "studentInfo.yearOfStudy": yearOfStudy,
          },
        },
        {
          $group: {
            _id: {
              date: { $substr: ["$date", 0, 10] },
              group: "$group",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: {
              date: "$_id.date",
              group: "$_id.group",
            },
            counts: {
              $push: {
                status: "$_id.status",
                count: "$count",
              },
            },
          },
        },
        {
          $project: {
            date: "$_id.date",
            group: "$_id.group",
            present: {
              $ifNull: [
                {
                  $first: {
                    $filter: {
                      input: "$counts",
                      as: "item",
                      cond: { $eq: ["$$item.status", "Present"] },
                    },
                  },
                },
                { count: 0 },
              ],
            },
            absent: {
              $ifNull: [
                {
                  $first: {
                    $filter: {
                      input: "$counts",
                      as: "item",
                      cond: { $eq: ["$$item.status", "Absent"] },
                    },
                  },
                },
                { count: 0 },
              ],
            },
          },
        },
        {
          $project: {
            date: 1,
            group: 1,
            present: "$present.count",
            absent: "$absent.count",
            total: { $add: ["$present.count", "$absent.count"] },
            percentage: {
              $cond: [
                { $eq: [{ $add: ["$present.count", "$absent.count"] }, 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        "$present.count",
                        { $add: ["$present.count", "$absent.count"] },
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
        { $sort: { date: -1, group: 1 } },
      ];

      const summary = await Attendance.aggregate(pipeline);
      results[yearOfStudy] = summary;
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance summary" });
  }
}
