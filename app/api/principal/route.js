import connectMongoDB from "@/lib/mongodb";
import { Principal } from "@/models/Principal";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("📥 Incoming POST request to /api/principal");

  try {
    await connectMongoDB();
    console.log("✅ DB connected");

    const body = await req.json();
    console.log("📦 Body received:", body);

    const { name, email, password, collegeId, photo } = body;

    if (!name || !email || !password || !collegeId) {
      console.log("⚠️ Missing fields");
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const existing = await Principal.findOne({ email });
    if (existing) {
      console.log("⚠️ Principal already exists");
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed");

    const newPrincipal = await Principal.create({
      name,
      email,
      password: hashedPassword,
      collegeId,
      photo,
    });

    console.log("✅ Principal created:", newPrincipal);

    return NextResponse.json(
      { message: "Principal created successfully", principal: newPrincipal },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json({ error: "Internal Server Error", detail: err.message }, { status: 500 });
  }
}
