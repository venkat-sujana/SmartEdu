import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam"; // ✅ CORRECT



export async function GET(request, { params }) {
  await connectMongoDB();
  const { id } = params;

  try {
    const exams = await Exam.find({ studentId: id });
    return NextResponse.json(exams);
  } catch (error) {
    console.error("Exam fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}
