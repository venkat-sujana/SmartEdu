//app/api/register/lecturer/route.js
// This is a Next.js API route for registering a lecturer
// It handles POST requests to register a new lecturer with validation and error handling
import cloudinary from "@/lib/cloudinary";
import Lecturer from "@/models/Lecturer";
import connectMongoDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { name, email, password, subject, collegeId, photo } = body;

    // ✅ Upload base64 image to Cloudinary
    let photoUrl = "";
    if (photo) {
      const uploadRes = await cloudinary.uploader.upload(photo, {
        folder: "lecturer_photos",
      });
      photoUrl = uploadRes.secure_url;
    }

    const existing = await Lecturer.findOne({ email });
    if (existing) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lecturer = await Lecturer.create({
      name,
      email,
      password: hashedPassword,
      subject,
      collegeId,
      role: "lecturer",
      photo: photoUrl,
    });

    return Response.json({ success: true, lecturer }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /register/lecturer:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return Response.json({ error: errors.join(", ") }, { status: 400 });
    }
    return Response.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
