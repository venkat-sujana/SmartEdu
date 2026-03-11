//app/api/principal/route.js

import connectMongoDB from "@/lib/mongodb";
import Principal from "@/models/Principal";
import cloudinary from "@/lib/cloudinary";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectMongoDB();

    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    const file = formData.get("photo");

    const { name, email, password, collegeId } = fields;

    if (!name || !email || !password || !collegeId) {
      return Response.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if principal already exists
    const existing = await Principal.findOne({ email });
    if (existing) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    // Upload photo to Cloudinary if file exists
    let photoUrl = "";
    if (file && typeof file === "object") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
      const cloudinaryResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "principal",
      });
      photoUrl = cloudinaryResponse.secure_url;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create principal document
    const principal = await Principal.create({
      name,
      email,
      password: hashedPassword,
      collegeId: new mongoose.Types.ObjectId(collegeId),
      role: "principal",
      photo: photoUrl, // set uploaded photo URL or ""
      dateOfJoining: new Date(),
    });

    return Response.json(
      {
        message: "Principal registered successfully",
        principal: {
          _id: principal._id,
          name: principal.name,
          email: principal.email,
          collegeId: principal.collegeId,
          role: principal.role,
          photo: principal.photo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Principal register error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
