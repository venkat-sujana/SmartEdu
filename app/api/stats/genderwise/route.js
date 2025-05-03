// app/api/stats/genderwise/route.js

import connectDB from "@/lib/mongodb.js";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const stats = await Student.aggregate([
    {
      $group: {
        _id: "$gender",
        count: { $sum: 1 },
      },
    },
  ]);

  return NextResponse.json(stats);
}
