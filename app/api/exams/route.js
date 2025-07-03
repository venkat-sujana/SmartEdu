// app/api/exams/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Exam from "@/models/Exam";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const collegeId = session.user.collegeId;

    const body = await req.json();
    const {
      studentId,
      stream,
      yearOfStudy,
      academicYear,
      examType,
      examDate,
      subjects,
    } = body;

    // 👉 Filter based on stream
    let filteredSubjects = {};
    if (["MPC", "BIPC", "CEC", "HEC"].includes(stream)) {
      filteredSubjects = Object.fromEntries(
        Object.entries(subjects).slice(0, 6)
      );
    } else if (["M&AT", "CET", "MLT"].includes(stream)) {
      filteredSubjects = Object.fromEntries(
        Object.entries(subjects).slice(0, 5)
      );
    }

    const subjectMarks = Object.values(filteredSubjects)
      .map(Number)
      .filter((n) => !isNaN(n));
    const total = subjectMarks.reduce((sum, mark) => sum + mark, 0);
    const percentage =
      subjectMarks.length > 0 ? (total / subjectMarks.length).toFixed(2) : 0;

    const examData = {
      studentId,
      stream,
      yearOfStudy,
      academicYear,
      examType,
      examDate: new Date(examDate),
      total,
      percentage,
      collegeId, // ✅ Injected from session
    };

    if (["MPC", "BIPC", "CEC", "HEC"].includes(stream)) {
      examData.generalSubjects = filteredSubjects;
    } else {
      examData.vocationalSubjects = filteredSubjects;
    }

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
export async function GET() {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    const collegeId = session?.user?.collegeId;

    const exams = await Exam.find({ collegeId }).populate("studentId", "name");

    const examsWithNames = exams.map((exam) => ({
      ...exam._doc,
      student: {
        name: exam.studentId?.name || "Unknown",
      },
    }));
    return NextResponse.json({ success: true, data: examsWithNames });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
