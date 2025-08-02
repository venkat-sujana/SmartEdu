// app/api/students/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { cloudinary } from "@/lib/cloudinary";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectMongoDB();

    // ✅ App Router లో request object పాస్ చేయకూడదు
    const session = await getServerSession(authOptions);
    console.log("SESSION DEBUG =>", JSON.stringify(session, null, 2));
    const lecturer = session?.user;

    const collegeName = lecturer?.collegeName;
    console.log("Lecturer session:", session);

    if (!lecturer?.collegeId) {
      return Response.json(
        { status: "error", message: "Unauthorized: No College ID" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());
    const file = formData.get("photo");

    let photoUrl = "";
    if (file && typeof file === "object") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

      const cloudinaryResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "students",
      });
      photoUrl = cloudinaryResponse.secure_url;
    }

    const requiredFields = [
      "name", "fatherName", "mobile", "group", "caste",
      "dob", "gender", "admissionNo", "yearOfStudy",
      "admissionYear", "address",
    ];

    for (const field of requiredFields) {
      if (!fields[field]) {
        return Response.json(
          { status: "error", message: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    const student = await Student.create({
      ...fields,
      collegeId: new mongoose.Types.ObjectId(lecturer.collegeId),
      collegeName,
      photo: photoUrl,
    });

    return Response.json({ status: "success", data: student }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");
    const group = searchParams.get("group");

    const filter = {};

    if (collegeId) {
      console.log("Received collegeId:", collegeId);
      // ✅ Valid ObjectId check చేయండి
      if (mongoose.Types.ObjectId.isValid(collegeId)) {
        filter.collegeId = new mongoose.Types.ObjectId(collegeId);
      } else {
        return Response.json(
          { status: "error", message: "Invalid collegeId format" },
          { status: 400 }
        );
      }
      console.log("Filter applied:", filter);
    }

    if (group) {
      console.log("Received group:", group);
      filter.group = group;
    }

    console.log("Final filter:", filter);

    const students = await Student.find(filter).sort({ createdAt: -1 });

    console.log("Students fetched:", students.length);
    return Response.json({ status: "success", data: students });
  } catch (error) {
    console.error("GET Error:", error);
    return Response.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}