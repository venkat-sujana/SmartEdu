import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";

function normalizeExamStream(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (normalized === "BIPC") return "BIPC";
  if (normalized === "M&AT" || normalized === "M@AT" || normalized === "MANDAT") {
    return "M&AT";
  }

  return normalized;
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );
}

function invalidId(message = "Invalid exam ID") {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

async function getCollegeIdFromSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.collegeId || null;
}

async function getExamId(context) {
  const params = await context.params;
  return params?.id || null;
}

export async function GET(req, context) {
  try {
    await connectMongoDB();
    const collegeId = await getCollegeIdFromSession();
    if (!collegeId) return unauthorized();

    const id = await getExamId(context);
    if (!mongoose.Types.ObjectId.isValid(id)) return invalidId();

    const exam = await Exam.findOne({ _id: id, collegeId });
    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exam }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    await connectMongoDB();
    const collegeId = await getCollegeIdFromSession();
    if (!collegeId) return unauthorized();

    const id = await getExamId(context);
    if (!mongoose.Types.ObjectId.isValid(id)) return invalidId();

    const body = await req.json();
    if (!mongoose.Types.ObjectId.isValid(body.studentId)) {
      return invalidId("Invalid student ID");
    }

    const exam = await Exam.findOne({ _id: id, collegeId });
    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    exam.studentId = body.studentId;
    exam.stream = normalizeExamStream(body.stream);
    exam.examType = body.examType;
    exam.examDate = body.examDate ? new Date(body.examDate) : exam.examDate;
    exam.academicYear = body.academicYear;
    exam.yearOfStudy = body.yearOfStudy;
    exam.generalSubjects = body.generalSubjects ?? [];
    exam.vocationalSubjects = body.vocationalSubjects ?? [];

    if (typeof body.total === "number") {
      exam.total = body.total;
    }

    if (typeof body.percentage === "number") {
      exam.percentage = body.percentage;
    }

    const updated = await exam.save();
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error updating exam",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectMongoDB();
    const collegeId = await getCollegeIdFromSession();
    if (!collegeId) return unauthorized();

    const id = await getExamId(context);
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return invalidId("Invalid or missing exam ID");
    }

    const deleted = await Exam.findOneAndDelete({ _id: id, collegeId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
