// ✅ BACKEND CODE (/pages/api/attendance/summary/daily-group.js)

import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";

export default async function handler(req, res) {
  await connectDB();

  try {
    const summary = await Attendance.aggregate([
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
                  { $divide: ["$present.count", { $add: ["$present.count", "$absent.count"] }] },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { date: -1, group: 1 } },
    ]);

    res.status(200).json(summary);
  } catch (err) {
    console.error("Error in daily group summary:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
