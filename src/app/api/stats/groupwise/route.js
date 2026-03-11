// app/api/stats/groupwise/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import Student from "@/models/Student";

export async function GET() {
  await connectDB();

  try {
    const groupData = await Student.aggregate([
      {
        $group: {
          _id: "$group",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json(groupData);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch group-wise stats", error }, { status: 500 });
  }
}