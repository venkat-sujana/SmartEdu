// /app/api/lecturers/register/route.js 
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";

export async function POST(req) {
  console.log("POST /api/lecturers/register");

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Invalid or missing JSON body:", err);
    return NextResponse.json({ message: "Invalid or missing JSON body" }, { status: 400 });
  }

  console.log("Request body:", body);

  try {
    await connectMongoDB();
    const { name, mobile, email, subject, password } = body;

    console.log("Checking if lecturer already exists with email", email);
    const existing = await Lecturer.findOne({ email });
    if (existing) {
      console.log("Lecturer already exists");
      return NextResponse.json({ message: "Lecturer already registered" }, { status: 400 });
    }

    console.log("Creating new lecturer");
    const lecturer = new Lecturer({ name, mobile, email, subject, password });
    await lecturer.save();

    console.log("Lecturer registered successfully");
    return NextResponse.json({ message: "Lecturer registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error registering lecturer:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


