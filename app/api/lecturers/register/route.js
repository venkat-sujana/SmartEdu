// app/api/lecturers/register/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import { hash } from "bcryptjs"; // ✅ hashing added
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { name, mobile, email, subject, password, collegeId } = await req.json();

    if (!name || !mobile || !email || !subject || !password || !collegeId) {
      return NextResponse.json({ message: "All fields are required including collegeId" }, { status: 400 });
    }

    const existing = await Lecturer.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Lecturer already registered" }, { status: 400 });
    }

    // ✅ hash password
    const hashedPassword = await hash(password, 10);

    const newLecturer = new Lecturer({
      name,
      mobile,
      email,
      subject,
      password: hashedPassword, // 👈 hashed password
      collegeId,
    });

    await newLecturer.save();

    return NextResponse.json({ message: "Lecturer registered successfully" }, { status: 201 });
  } catch (err) {
    console.error("Lecturer Registration Error:", err);
    return NextResponse.json({ message: "Registration failed", error: err.message }, { status: 500 });
  }
}
