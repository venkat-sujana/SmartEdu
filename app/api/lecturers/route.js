// api/lecturers/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import College from "@/models/College"; // 👉 Import College model
import cloudinary from "@/lib/cloudinary";
import bcrypt from "bcryptjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const dynamic = "force-dynamic";

// GET all lecturers
export async function GET() {
  await connectMongoDB();
  const lecturers = await Lecturer.find();
  return NextResponse.json(lecturers);
}

// POST: New Lecturer creation with photo upload and college name injection
export async function POST(req) {
  try {
    await connectMongoDB();

    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());

    const file = formData.get("photo");
    let photoUrl = "";

    // ✅ Upload photo to Cloudinary
    if (file && typeof file === "object") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
      const cloudinaryResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "lecturers",
      });
      photoUrl = cloudinaryResponse.secure_url;
    }

    // ✅ Fetch College
    const college = await College.findById(fields.collegeId);
    if (!college) {
      return NextResponse.json(
        { status: "error", message: "Invalid College ID" },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(fields.password, 10);
    fields.password = hashedPassword;

    // ✅ Create Lecturer
    const lecturer = await Lecturer.create({
      ...fields,
      collegeName: college.name,
      photo: photoUrl,
    });

    return NextResponse.json({ status: "success", data: lecturer }, { status: 201 });

  } catch (error) {
    console.error("Lecturer upload error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
