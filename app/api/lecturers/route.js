//app/api/lecturers/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Lecturer from "@/models/Lecturer"; 
import connectMongoDB from "@/lib/mongodb"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🔹 Register Lecturer
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

// 🔹 Get lecturers + count
export async function GET(req) {
  console.log("GET /api/lecturers called");
  try {
    await connectMongoDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session data:", session);

    const filter = { collegeId: session.user.collegeId };
    console.log("Filter:", filter);
    const lecturers = await Lecturer.find(filter);
    const totalLecturers = await Lecturer.countDocuments(filter);

    console.log("Total lecturers:", totalLecturers);
    console.log("Lecturers:", lecturers);

    return NextResponse.json({
      status: "success",
      totalLecturers,
      data: lecturers,
    });
  } catch (error) {
    console.error("GET /api/lecturers error:", error);
    return NextResponse.json({ error: "Failed to fetch lecturers" }, { status: 500 });
  }
}
