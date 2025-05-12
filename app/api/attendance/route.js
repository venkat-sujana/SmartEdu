// route.js
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import  connectMongoDB  from "@/lib/mongodb";

import mongoose from "mongoose";

export async function POST(req) {
  await connectMongoDB();

  try {
    const attendanceArray = await req.json();
    console.log("📥 Received:", attendanceArray);
   alert("Received data:", attendanceArray);
    if (!Array.isArray(attendanceArray) || attendanceArray.length === 0) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const formattedData = attendanceArray.map((item) => ({
      ...item,
      studentId: new mongoose.Types.ObjectId(item.studentId),
    }));

    await Attendance.insertMany(formattedData);

    return NextResponse.json(
      { message: "Attendance saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving attendance:", error);
    return NextResponse.json(
      { message: "Error saving attendance", error: error.message },
      { status: 500 }
    );
  }
}
