//src/app/api/admin/exams/[id]/route.js
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

export async function PUT(req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam id" }, { status: 400 });
    }

    const existing = await Exam.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const body = await req.json();
    const collegeId = body.collegeId || String(existing.collegeId);
    const studentId = body.studentId || String(existing.studentId);
    const examDateValue = body.examDate || existing.examDate;

    if (!mongoose.Types.ObjectId.isValid(collegeId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid collegeId or studentId" }, { status: 400 });
    }

    if (!isValidDate(examDateValue)) {
      return NextResponse.json({ error: "Invalid exam date" }, { status: 400 });
    }

    const student = await Student.findOne({ _id: studentId, collegeId }).lean();
    if (!student) {
      return NextResponse.json({ error: "Student not found for selected college" }, { status: 404 });
    }

    const stream = normalizeStream(student.group);
    if (!GENERAL_STREAMS.has(stream) && !VOCATIONAL_STREAMS.has(stream)) {
      return NextResponse.json({ error: `Unsupported student group for exams: ${student.group}` }, { status: 400 });
    }

    const subjectsSource =
      body.subjects ||
      existing.generalSubjects ||
      existing.vocationalSubjects;
    const subjects = normalizeSubjects(subjectsSource);
    if (!subjects) {
      return NextResponse.json({ error: "Subjects must be a JSON object with numeric marks" }, { status: 400 });
    }

    const { total, percentage } = calculateResult(subjects);
    const update = {
      collegeId,
      studentId,
      stream,
      yearOfStudy: student.yearOfStudy,
      academicYear: String(body.academicYear || existing.academicYear).trim(),
      examType: body.examType || existing.examType,
      examDate: new Date(examDateValue),
      total,
      percentage,
      generalSubjects: GENERAL_STREAMS.has(stream) ? subjects : undefined,
      vocationalSubjects: VOCATIONAL_STREAMS.has(stream) ? subjects : undefined,
    };

    const updated = await Exam.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("studentId", "name admissionNo group yearOfStudy")
      .populate("collegeId", "name");

    return NextResponse.json({ message: "Exam updated", data: updated });
  } catch (error) {
    console.error("Admin exams PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(_req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam id" }, { status: 400 });
    }

    const deleted = await Exam.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Exam deleted" });
  } catch (error) {
    console.error("Admin exams DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}
