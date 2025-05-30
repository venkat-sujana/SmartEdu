// /app/api/lecturers/login/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import jwt from "jsonwebtoken";
import { redirect } from 'next/navigation'

const JWT_SECRET = process.env.JWT_SECRET || "secret1229";

export function GET() {
  return redirect('/login')
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const { email, password } = await req.json();

    const lecturer = await Lecturer.findOne({ email });
    if (!lecturer) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await lecturer.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

   const token = jwt.sign(
  {
    id: lecturer._id,
    name: lecturer.name,   // ✅ add this
    email: lecturer.email,
    role: lecturer.role,
    subject: lecturer.subject, // ✅ add this
    assignedGroups: lecturer.assignedGroups, // ✅ add this
  },
  JWT_SECRET,
  { expiresIn: "1d" }
);


    return NextResponse.json({ message: "Login successful", token, lecturer: {
      id: lecturer._id,
      name: lecturer.name,
      email: lecturer.email,
      role: lecturer.role,
      subject: lecturer.subject,
      assignedGroups: lecturer.assignedGroups,
    }});
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}