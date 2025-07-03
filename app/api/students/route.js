// app/api/students/route.js

import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import cloudinary from "@/lib/cloudinary";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // 👈 మీరు ఇది ఎక్కడైనా స్టోర్ చేస్తే import చేయాలి

export const config = {
  api: {
    bodyParser: false,
  },
};

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    const lecturer = session?.user;

    if (!lecturer?.collegeId) {
      return Response.json({ status: "error", message: "Unauthorized: No College ID" }, { status: 401 });
    }

    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());

    const file = formData.get("photo");
    let photoUrl = "";

    if (file && typeof file === "object") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "students",
      });

      photoUrl = cloudinaryResponse.secure_url;
    }

    // ✅ Required fields (excluding collegeId)
    const requiredFields = [
      "name", "fatherName", "mobile", "group", "caste",
      "dob", "gender", "admissionNo", "yearOfStudy", "admissionYear",
      "address"
    ];

    for (const field of requiredFields) {
      if (!fields[field]) {
        return Response.json({ status: "error", message: `Missing field: ${field}` }, { status: 400 });
      }
    }

    // ✅ Attach session-based collegeId (Ignore formData.collegeId)
    const student = await Student.create({
      ...fields,
      collegeId: lecturer.collegeId,
      photo: photoUrl,
    });

    return Response.json({ status: "success", data: student }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
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
      filter.collegeId = new mongoose.Types.ObjectId(collegeId);
      console.log("Filter applied:", filter);
    }


    if (group) {
      console.log("Received group:", group);
      filter.group = group;
    }

    console.log("Filter applied:", filter);
    


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





