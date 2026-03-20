import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getAdminSession } from "@/lib/requireAdminSession";

function isValidDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeSession(value) {
  return value === "AN" ? "AN" : "FN";
}

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
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 1000);
    const skip = (page - 1) * limit;
    const query = {};

    if (collegeId) {
      query.collegeId = collegeId;
    }

    if (search) {
      const studentQuery = {};
      if (collegeId) {
        studentQuery.collegeId = collegeId;
      }
      studentQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { admissionNo: { $regex: search, $options: "i" } },
      ];

      const matchingStudents = await Student.find(studentQuery).select("_id").lean();
      const studentIds = matchingStudents.map((item) => item._id);

      query.$or = [
        { studentId: { $in: studentIds } },
        { group: { $regex: search, $options: "i" } },
        { yearOfStudy: { $regex: search, $options: "i" } },
        { session: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { lecturerName: { $regex: search, $options: "i" } },
      ];
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate("studentId", "name admissionNo group yearOfStudy")
        .populate("collegeId", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    return NextResponse.json({
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Admin attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
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

    const requiredFields = ["collegeId", "studentId", "date", "status"];
    const missing = requiredFields.filter((field) => !String(body[field] || "").trim());
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.collegeId) || !mongoose.Types.ObjectId.isValid(body.studentId)) {
      return NextResponse.json({ error: "Invalid collegeId or studentId" }, { status: 400 });
    }

    if (!isValidDate(body.date)) {
      return NextResponse.json({ error: "Invalid attendance date" }, { status: 400 });
    }

    const student = await Student.findOne({
      _id: body.studentId,
      collegeId: body.collegeId,
    }).lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found for selected college" }, { status: 404 });
    }

    const date = new Date(body.date);
    const sessionValue = normalizeSession(body.session);
    const duplicate = await Attendance.findOne({
      studentId: body.studentId,
      date,
      session: sessionValue,
    }).lean();

    if (duplicate) {
      return NextResponse.json({ error: "Attendance already exists for this student/date/session" }, { status: 409 });
    }

    const attendance = await Attendance.create({
      studentId: body.studentId,
      collegeId: body.collegeId,
      date,
      session: sessionValue,
      status: body.status,
      group: student.group,
      yearOfStudy: student.yearOfStudy,
      lecturerName: body.lecturerName?.trim() || "",
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      markedAt: new Date(),
    });

    const created = await Attendance.findById(attendance._id)
      .populate("studentId", "name admissionNo group yearOfStudy")
      .populate("collegeId", "name")
      .lean();

    return NextResponse.json({ message: "Attendance created", data: created }, { status: 201 });
  } catch (error) {
    console.error("Admin attendance POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create attendance" }, { status: 500 });
  }
}
