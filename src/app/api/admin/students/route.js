import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { getAdminSession } from "@/lib/requireAdminSession";

export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 100);
    const skip = (page - 1) * limit;
    const query = {};

    if (collegeId) query.collegeId = collegeId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { admissionNo: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { parentMobile: { $regex: search, $options: "i" } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate("collegeId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);

    return NextResponse.json({
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Admin students GET error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const body = await req.json();

    const requiredFields = [
      "name",
      "fatherName",
      "mobile",
      "parentMobile",
      "group",
      "caste",
      "gender",
      "yearOfStudy",
      "admissionYear",
      "address",
      "admissionNo",
      "collegeId",
      "password",
    ];

    const missing = requiredFields.filter((field) => !String(body[field] || "").trim());
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const exists = await Student.findOne({ admissionNo: body.admissionNo.trim().toUpperCase() });
    if (exists) {
      return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
    }

    const student = await Student.create({
      name: body.name.trim(),
      fatherName: body.fatherName.trim(),
      mobile: body.mobile.trim(),
      parentMobile: body.parentMobile.trim(),
      group: body.group,
      caste: body.caste,
      gender: body.gender,
      yearOfStudy: body.yearOfStudy,
      admissionYear: Number(body.admissionYear),
      address: body.address.trim(),
      admissionNo: body.admissionNo.trim().toUpperCase(),
      collegeId: body.collegeId,
      password: await bcrypt.hash(body.password.trim(), 10),
      status: body.status || "Active",
      dob: body.dob || undefined,
      dateOfJoining: body.dateOfJoining || undefined,
      photo: body.photo || "",
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
      role: "student",
    });

    const created = await Student.findById(student._id).populate("collegeId", "name").lean();
    return NextResponse.json({ message: "Student created", data: created }, { status: 201 });
  } catch (error) {
    console.error("Admin students POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}
