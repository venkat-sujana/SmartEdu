// app/api/exams/[id]/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";

// GET
export async function GET(req, context) {
  try {
    await connectMongoDB();

    const { id } = await context.params;   // ✅ ముఖ్యమైన line
    console.log("GET examId =>", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exam }, { status: 200 });
  } catch (error) {
    console.error("GET /api/exams/[id] error:", error);
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

    const { id } = await context.params;   // ✅ ఇదే pattern
    const body = await req.json();
console.log("RAW params =>", await context.params);
    console.log("PUT examId =>", id);
    console.log("PUT body =>", body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("PUT error: invalid exam ID =>", id);
      return NextResponse.json(
        { success: false, message: "❌ Invalid exam ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.studentId)) {
      console.error("PUT error: invalid student ID =>", body.studentId);
      return NextResponse.json(
        { success: false, message: "❌ Invalid student ID" },
        { status: 400 }
      );
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

    console.log("PUT updateData =>", updateData);

    const updated = await Exam.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      console.error("PUT error: exam not found =>", id);
      return NextResponse.json(
        { success: false, message: "❌ Exam not found" },
        { status: 404 }
      );
    }

    console.log("PUT success: updated exam =>", updated);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "❌ Error updating exam",
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

    const { id } = await context.params;   // ✅ ఇక్కడ కూడా
    console.log("DELETE examId =>", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const deleted = await Exam.findByIdAndDelete(id);
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
    console.error("DELETE error:", error);
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
