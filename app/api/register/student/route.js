// app/api/register/student/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import College from "@/models/College";

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
