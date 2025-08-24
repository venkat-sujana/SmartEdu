
//app/api/register/lecturer/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer"; // ✅ correct import
import College from "@/models/College";

export async function POST(req) {
  await connectMongoDB();

  try {
    const { name, email, password, subject, collegeId } = await req.json();

    const existingLecturer = await Lecturer.findOne({ email });
    if (existingLecturer) {
      return NextResponse.json({ error: "Lecturer already exists" }, { status: 400 });
    }

    // ✅ Get college name using ID
    const college = await College.findById(collegeId);
    if (!college) {
      return NextResponse.json({ error: "Invalid college ID" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newLecturer = new Lecturer({
      name,
      email,
      password: hashedPassword,
      subject,
      collegeId,
      collegeName: college.name, // ✅ Add this line
    });

    await newLecturer.save();

    return NextResponse.json({ message: "Lecturer registered successfully" });
  } catch (error) {
    console.error("Lecturer register error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
