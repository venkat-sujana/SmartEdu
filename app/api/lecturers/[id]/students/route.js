// app/api/lecturers/[id]/students/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import Student from "@/models/Student";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();

    // Destructure params after awaiting
    const { id } = params;
    const lecturer = await Lecturer.findById(id).populate("assignedStudents");

    if (!lecturer) {
      return NextResponse.json({ message: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json({ students: lecturer.assignedStudents });
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
