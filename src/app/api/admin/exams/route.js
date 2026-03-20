import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Student from "@/models/Student";
import { getAdminSession } from "@/lib/requireAdminSession";

const GENERAL_STREAMS = new Set(["MPC", "BIPC", "CEC", "HEC"]);
const VOCATIONAL_STREAMS = new Set(["M&AT", "CET", "MLT"]);

function normalizeStream(group) {
  if (group === "BiPC") return "BIPC";
  return group;
}

function normalizeSubjects(subjects) {
  if (!subjects || typeof subjects !== "object" || Array.isArray(subjects)) {
    return null;
  }

  const normalized = {};

  Object.entries(subjects).forEach(([key, value]) => {
    const subjectName = String(key || "").trim();
    if (!subjectName) return;

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    normalized[subjectName] = numeric;
  });

  return Object.keys(normalized).length ? normalized : null;
}

function calculateResult(subjects) {
  const values = Object.values(subjects || {});
  const total = values.reduce((sum, mark) => sum + Number(mark || 0), 0);
  const percentage = values.length ? Number((total / values.length).toFixed(2)) : 0;
  return { total, percentage };
}

function isValidDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
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
        { examType: { $regex: search, $options: "i" } },
        { academicYear: { $regex: search, $options: "i" } },
        { stream: { $regex: search, $options: "i" } },
      ];
    }

    const [records, total] = await Promise.all([
      Exam.find(query)
        .populate("studentId", "name admissionNo group yearOfStudy")
        .populate("collegeId", "name")
        .sort({ examDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Exam.countDocuments(query),
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
    console.error("Admin exams GET error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
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

    const requiredFields = ["collegeId", "studentId", "academicYear", "examType", "examDate"];
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

    if (!isValidDate(body.examDate)) {
      return NextResponse.json({ error: "Invalid exam date" }, { status: 400 });
    }

    const student = await Student.findOne({
      _id: body.studentId,
      collegeId: body.collegeId,
    }).lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found for selected college" }, { status: 404 });
    }

    const stream = normalizeStream(student.group);
    if (!GENERAL_STREAMS.has(stream) && !VOCATIONAL_STREAMS.has(stream)) {
      return NextResponse.json({ error: `Unsupported student group for exams: ${student.group}` }, { status: 400 });
    }

    const subjects = normalizeSubjects(body.subjects);
    if (!subjects) {
      return NextResponse.json({ error: "Subjects must be a JSON object with numeric marks" }, { status: 400 });
    }

    const { total, percentage } = calculateResult(subjects);
    const payload = {
      studentId: body.studentId,
      collegeId: body.collegeId,
      stream,
      yearOfStudy: student.yearOfStudy,
      academicYear: String(body.academicYear).trim(),
      examType: body.examType,
      examDate: new Date(body.examDate),
      total,
      percentage,
    };

    if (GENERAL_STREAMS.has(stream)) {
      payload.generalSubjects = subjects;
      payload.vocationalSubjects = undefined;
    } else {
      payload.vocationalSubjects = subjects;
      payload.generalSubjects = undefined;
    }

    const exam = await Exam.create(payload);

    const created = await Exam.findById(exam._id)
      .populate("studentId", "name admissionNo group yearOfStudy")
      .populate("collegeId", "name")
      .lean();

    return NextResponse.json({ message: "Exam created", data: created }, { status: 201 });
  } catch (error) {
    console.error("Admin exams POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create exam" }, { status: 500 });
  }
}
