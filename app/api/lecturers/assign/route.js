import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";

// GET all lecturers (existing code)
export async function GET() {
  await connectMongoDB();
  const lecturers = await Lecturer.find();
  return NextResponse.json(lecturers);
}

// NEW: Handle POST requests for assigning students
export async function POST(req) {
  try {
    await connectMongoDB();
    const { lecturerId, studentIds } = await req.json();

    // Update lecturer with assigned students
    const lecturer = await Lecturer.findByIdAndUpdate(
      lecturerId,
      { $addToSet: { assignedStudents: { $each: studentIds } } },
      { new: true }
    );

    if (!lecturer) {
      return NextResponse.json({ message: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Students assigned successfully", lecturer });
  } catch (error) {
    console.error("Error assigning students:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}