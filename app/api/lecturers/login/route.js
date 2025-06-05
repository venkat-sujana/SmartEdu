import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { email, password } = await req.json();

    const lecturer = await Lecturer.findOne({ email: email.toLowerCase() }).select("+password");
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
        email: lecturer.email,
        name: lecturer.name,
        role: lecturer.role,
        subject: lecturer.subject,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      lecturer: {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        subject: lecturer.subject,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Login failed", error: error.message }, { status: 500 });
  }
}
