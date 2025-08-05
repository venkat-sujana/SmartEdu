import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Lecturer from "@/models/Lecturer"; // adjust the path
import connectMongoDB from "@/lib/mongodb"; // your DB connection function

export async function POST(req) {
  await connectMongoDB();

  const body = await req.json();
  const { name, email, password, subject, collegeId, photo } = body;

  try {
    // ✅ check if email exists
    const existing = await Lecturer.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // ✅ hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ create lecturer
    const lecturer = await Lecturer.create({
      name,
      email,
      password: hashedPassword,
      subject,
      collegeId,
      photo,
    });

    return NextResponse.json({ message: "Lecturer registered successfully", lecturer });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
