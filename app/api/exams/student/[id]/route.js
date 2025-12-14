// app/api/exams/student/[id]/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";

export async function GET(request, context) {
  await connectMongoDB();

  // ✅ Next.js 16: params is a Promise, so await it
  const { id } = await context.params;
  console.log("API params =", await context.params);
  console.log("API id =", id);

  if (!id) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    const exams = await Exam.find({ studentId: id }).sort({ examDate: -1 });
    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error("Exam fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
