// app/api/register/student/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import College from "@/models/College";

export async function GET(req) {
  await connectMongoDB();

  try {
    const { searchParams } = new URL(req.url);
    const admissionNo = (searchParams.get("admissionNo") || "").trim();

    if (!admissionNo) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const existingStudent = await Student.findOne({ admissionNo }).select("_id").lean();
    return NextResponse.json({ exists: Boolean(existingStudent) }, { status: 200 });
  } catch (error) {
    console.error("Student duplicate check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  await connectMongoDB();

  try {
    const {
      name,
      fatherName,
      mobile,
      group,
      caste,
      dob,
      gender,
      admissionNo,
      password,
      yearOfStudy,
      admissionYear,
      address,
      photo,
      collegeId,
      subjects,
    } = await req.json();

    // 🔎 Check if student already exists
    const existingStudent = await Student.findOne({ admissionNo });
    if (existingStudent) {
      return NextResponse.json(
        { error: "Student already exists with this Admission No" },
        { status: 400 }
      );
    }

    // ✅ Validate College
    const college = await College.findById(collegeId);
    if (!college) {
      return NextResponse.json({ error: "Invalid college ID" }, { status: 400 });
    }

    // 🔑 Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Create new Student
    const newStudent = new Student({
      name,
      fatherName,
      mobile,
      group,
      caste,
      dob,
      gender,
      admissionNo,
      password: hashedPassword,
      yearOfStudy,
      admissionYear,
      address,
      photo: photo || "",
      collegeId,
      subjects,
      role: "student",
    });

    await newStudent.save();

    return NextResponse.json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("Student register error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
