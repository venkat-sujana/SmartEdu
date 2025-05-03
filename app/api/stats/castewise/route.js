// app/api/stats/castewise/route.js

import connectDB from "@/lib/mongodb.js"; // Import the MongoDB connection function from your lib/mongodb";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const stats = await Student.aggregate([
    {
      $group: {
        _id: "$caste",
        count: { $sum: 1 },
      },
    },
  ]);

  return NextResponse.json(stats);
}
