//app/api/exams/[id]/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";

export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const deleted = await Exam.findByIdAndDelete(params.id);

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

export async function PUT(req, { params }) {
  const id = params.id;
  const body = await req.json();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "❌ Invalid exam ID" },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(body.studentId)) {
    return NextResponse.json(
      { success: false, message: "❌ Invalid student ID" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();

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
    }
    if (body.vocationalSubjects) {
      updateData.vocationalSubjects = body.vocationalSubjects;
    }

    const updated = await Exam.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "❌ Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Update error:", err);
    return NextResponse.json(
      { success: false, message: "❌ Error updating exam", error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  try {
    await connectMongoDB();

    const { params } = await context;
    const { id: studentId } = params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;

    const exams = await Exam.find({ studentId, collegeId }).sort({
      examDate: -1,
    });

    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error("Error fetching student exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam results" },
      { status: 500 }
    );
  }
}





