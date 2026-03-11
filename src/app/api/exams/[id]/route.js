// app/api/exams/[id]/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";

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

// GET
export async function GET(req, context) {
  try {
    await connectMongoDB();
    const collegeId = await getCollegeIdFromSession();
    if (!collegeId) return unauthorized();

    const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return invalidId();

    const exam = await Exam.findOne({ _id: id, collegeId });
    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exam }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

// PUT
export async function PUT(req, context) {
  try {
    await connectMongoDB();
    const collegeId = await getCollegeIdFromSession();
    if (!collegeId) return unauthorized();

    const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return invalidId();

    const body = await req.json();
    if (!mongoose.Types.ObjectId.isValid(body.studentId)) {
      return invalidId("Invalid student ID");
    }

    const updateData = {
      studentId: body.studentId,
      stream: body.stream,
      examType: body.examType,
      examDate: body.examDate,
      academicYear: body.academicYear,
      yearOfStudy: body.yearOfStudy,
      total: body.total,
      percentage: body.percentage,
    };

    if (body.generalSubjects) {
      updateData.generalSubjects = body.generalSubjects;
      updateData.vocationalSubjects = undefined;
    }
    if (body.vocationalSubjects) {
      updateData.vocationalSubjects = body.vocationalSubjects;
      updateData.generalSubjects = undefined;
    }

    const updated = await Exam.findOneAndUpdate(
      { _id: id, collegeId },
      updateData,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Error updating exam",
        error: err.message,
      },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req, context) {
  try {
    await connectMongoDB();
    const collegeId = await getCollegeIdFromSession();
    if (!collegeId) return unauthorized();

    const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return invalidId();

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
