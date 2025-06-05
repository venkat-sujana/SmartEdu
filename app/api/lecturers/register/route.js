import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { name, mobile, email, subject, password } = await req.json();

    if (!name || !mobile || !email || !subject || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existing = await Lecturer.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Lecturer already registered" }, { status: 400 });
    }

    const newLecturer = new Lecturer({ name, mobile, email, subject, password });
    await newLecturer.save();

    return NextResponse.json({ message: "Lecturer registered successfully" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Registration failed", error: err.message }, { status: 500 });
  }
}
