import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import mongoose from "mongoose";

function normalizeGroupValue(group) {
  if (!group) return group;

  return group === "BIPC" ? "BiPC" : group;
}

function normalizeAdmissionNo(value) {
  if (value == null) return "";

  return String(value).trim().toUpperCase();
}

export async function POST(req) {
  try {
    await connectMongoDB();

    const formData = await req.formData();

    // Extract fields
    const name = formData.get("name");
    const fatherName = formData.get("fatherName");
    const mobile = formData.get("mobile");
    const admissionNo = normalizeAdmissionNo(formData.get("admissionNo"));
    const group = normalizeGroupValue(formData.get("group"));
    const caste = formData.get("caste");
    const gender = formData.get("gender");
    const yearOfStudy = formData.get("yearOfStudy");
    const admissionYear = parseInt(formData.get("admissionYear"));
    const dateOfJoining = formData.get("dateOfJoining");
    const password = formData.get("password") || "default123";
    const address = formData.get("address");
    const collegeId = formData.get("collegeId");
    const normalizedDateOfJoining = dateOfJoining ? new Date(dateOfJoining) : new Date();

    if (!name || !fatherName || !mobile || !admissionNo || !group || !address || !collegeId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Duplicate check
    const existing = await Student.findOne({ admissionNo });
    if (existing) {
      return NextResponse.json(
        { message: "Admission No already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = new Student({
      name, fatherName, mobile, admissionNo, group, caste, gender,
      yearOfStudy, admissionYear, dateOfJoining: normalizedDateOfJoining,
      dob: normalizedDateOfJoining,
      address, collegeId: new mongoose.Types.ObjectId(collegeId),
      password: hashedPassword, status: "Active"
    });

    await student.save();

    return NextResponse.json({
      success: true,
      studentId: student._id,
      message: "Student registered successfully",
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "admissionNo") {
        const duplicateValue = error.keyValue?.admissionNo;

        return NextResponse.json(
          {
            message:
              duplicateValue == null
                ? "Admission No is required and cannot be empty. Existing null admission records may need cleanup."
                : `Admission No ${duplicateValue} already exists`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

