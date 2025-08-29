// app/api/exams/student/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");

    if (!collegeId) {
      return NextResponse.json(
        { success: false, message: "College ID is required" },
        { status: 400 }
      );
    }

    const students = await Student.find({ collegeId }).sort({ name: 1 });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Student fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
