//app/api/lecturers/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import Lecturer from "@/models/Lecturer"; 
import connectMongoDB from "@/lib/mongodb"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import College from "@/models/College";

// 🔹 Register Lecturer
export async function POST(req) {
  await connectMongoDB();

  try {
    // ✅ read body once only
    const { name, email, password, subject, collegeId, photo } = await req.json();
    console.log("Incoming data:", { name, email, subject, collegeId });

    // ✅ check if email exists
    const existing = await Lecturer.findOne({ email });
    if (existing) {
      console.log("Email already registered");
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // ✅ fetch collegeName from DB
    const college = await College.findById(collegeId);
    if (!college) {
      return NextResponse.json({ error: "Invalid collegeId" }, { status: 400 });
    }

    // ✅ hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Hashed password:", hashedPassword);

    // ✅ create lecturer, include both collegeId and collegeName
    const lecturer = await Lecturer.create({
      name,
      email,
      password: hashedPassword,
      subject,
      collegeId,
      collegeName: college.name, // auto-fill
      photo,
    });

    console.log("Created lecturer:", lecturer);
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
