// app/api/exams/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import { createExamSchema } from "@/validations/examValidation";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

function normalizeExamStream(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!normalized) return "";
  if (normalized === "BIPC") return "BIPC";
  if (normalized === "MPC") return "MPC";
  if (normalized === "CEC") return "CEC";
  if (normalized === "HEC") return "HEC";
  if (normalized === "CET") return "CET";
  if (normalized === "MLT") return "MLT";
  if (normalized === "M&AT" || normalized === "M@AT" || normalized === "MANDAT") {
    return "M&AT";
  }

  return String(value || "").trim();
}

// POST - Create Exam
export async function POST(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { collegeId: sessionCollegeId } = session.user;

    const body = await req.json();
    const data = createExamSchema.parse(body);
    data.collegeId = sessionCollegeId;

    if (data.collegeId !== sessionCollegeId) {
      return NextResponse.json({ success: false, message: "College mismatch" }, { status: 403 });
    }

    // Use model hook for total/percentage
    const examData = {
      ...data,
      examDate: new Date(data.examDate),
    };

    const exam = new Exam(examData);
    await exam.save();

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Error saving exam:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// GET - All Exams
export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    const collegeId = session?.user?.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const includeTerminated = searchParams.get("includeTerminated") === "true";
    const stream = normalizeExamStream(searchParams.get("stream"));
    const yearOfStudy = searchParams.get("yearOfStudy");
    const examType = searchParams.get("examType");
    const academicYear = searchParams.get("academicYear");
    const limitParam = Number(searchParams.get("limit") || 0);

    const query = { collegeId };

    if (stream) {
      query.stream = stream === "BIPC" ? { $in: ["BIPC", "BiPC"] } : stream;
    }

    if (yearOfStudy) {
      query.yearOfStudy = yearOfStudy;
    }

    if (examType) {
      query.examType = examType;
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    const examsQuery = Exam.find(query)
      .populate("studentId", "name yearOfStudy status group admissionNo")
      .sort({ examDate: -1, createdAt: -1 });

    if (limitParam > 0) {
      examsQuery.limit(limitParam);
    }

    const exams = await examsQuery;

    const examsWithNames = exams.map((exam) => ({
      ...exam._doc,
      yearOfStudy: exam.yearOfStudy,
      currentYearOfStudy: exam.studentId?.yearOfStudy || null,
      isStudentActive: exam.studentId?.status === "Active",
      student: {
        name: exam.studentId?.name || "Unknown",
        group: exam.studentId?.group || exam.stream,
        admissionNo: exam.studentId?.admissionNo || "",
      },
    }));

    const filtered = includeTerminated
      ? examsWithNames
      : examsWithNames.filter((e) => e.isStudentActive);

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
