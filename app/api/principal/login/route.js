import { NextResponse } from "next/server";
import { Principal } from "@/models/Principal";
import connectMongoDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey"; // keep in .env

export async function POST(req) {
  await connectMongoDB();

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const principal = await Principal.findOne({ email });
  if (!principal) {
    return NextResponse.json({ error: "Principal not found" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, principal.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = jwt.sign(
    {
      id: principal._id,
      email: principal.email,
      name: principal.name,
      photo: principal.photo,
      collegeId: principal.collegeId,
      role: "principal",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return NextResponse.json(
    {
      message: "Login successful",
      token,
      principal: {
        name: principal.name,
        email: principal.email,
        photo: principal.photo,
        collegeId: principal.collegeId,
      },
    },
    { status: 200 }
  );
}
