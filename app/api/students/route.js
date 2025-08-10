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

    const session = await getServerSession(authOptions);
    const lecturer = session?.user;

    if (!lecturer?.collegeId || (!lecturer?.subject && !lecturer?.group)) {
      return Response.json(
        { status: "error", message: "Unauthorized: Missing College ID or Subject/Group" },
        { status: 401 }
      );
    }

    const collegeName = lecturer.collegeName;

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
      // Vocational అయితే group ద్వారా, లేకపోతే subject ద్వారా link
      subjects: lecturer.group ? [] : [lecturer.subject],
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    let filter = {
      collegeId: session.user.collegeId
    };

    // Vocational stream => filter by group
    if (session.user.stream === "Vocational" && session.user.group) {
      filter.group = session.user.group;
    }

    // General stream => filter by subject array match
    if (session.user.stream === "General" && session.user.subject) {
      filter.subjects = session.user.subject; // exact match in array
    }

    const students = await Student.find(filter);

    return Response.json({
      status: "success",
      data: students
    });
  } catch (error) {
    console.error(error);
    return Response.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}


