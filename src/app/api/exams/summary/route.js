// src/app/api/exams/summary/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";

import Student from "@/models/Student";
import Exam from "@/models/Exam";

import {
  calculateSummary,
  normalizeExamStream,
} from "@/lib/examUtils";

export async function GET(req) {
  try {
    await connectMongoDB();

    // ===============================
    // Authentication
    // ===============================
    const session = await getServerSession(authOptions);

    if (!session?.user?.collegeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const collegeId = session.user.collegeId;

    // ===============================
    // Query Parameters
    // ===============================

    const { searchParams } = new URL(req.url);

    const stream = normalizeExamStream(searchParams.get("stream"));

    const yearOfStudy = searchParams.get("yearOfStudy");

    const examType = searchParams.get("examType");

    const academicYear = searchParams.get("academicYear");

    // ===============================
    // Student Query
    // ===============================

    const studentQuery = {
      collegeId,
      status: "Active",
    };

    if (stream) {
      studentQuery.group = stream;
    }

    if (yearOfStudy) {
      studentQuery.yearOfStudy = yearOfStudy;
    }

    // ===============================
    // Exam Query
    // ===============================

    const examQuery = {
      collegeId,
    };

    if (stream) {
      examQuery.stream = stream;
    }

    if (yearOfStudy) {
      examQuery.yearOfStudy = yearOfStudy;
    }

    if (examType) {
      examQuery.examType = examType;
    }

    if (academicYear) {
      examQuery.academicYear = academicYear;
    }

    // ===============================
    // Fetch Data
    // ===============================

    const [students, exams] = await Promise.all([
      Student.find(studentQuery).lean(),
      Exam.find(examQuery).lean(),
    ]);

    // ===============================
    // Calculate Summary
    // ===============================

    const summary = calculateSummary({
      students,
      exams,
    });

    // ===============================
    // Response
    // ===============================

    return NextResponse.json({
      success: true,

      filters: {
        stream,
        yearOfStudy,
        examType,
        academicYear,
      },

      summary,
    });
  } catch (error) {
    console.error("Exam Summary Error:", error);
console.log(summary);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}