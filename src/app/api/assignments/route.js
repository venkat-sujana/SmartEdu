//src/app/api/assignments/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectMongoDB from "@/lib/mongodb";
import AssignmentMarks from "@/models/AssignmentMarks";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const { searchParams } = new URL(req.url);

    const filter = {
      collegeId: session.user.collegeId,
    };

    const academicYear = searchParams.get("academicYear");
    const yearOfStudy = searchParams.get("yearOfStudy");
    const group = searchParams.get("group");
    const subject = searchParams.get("subject");
    const studentId = searchParams.get("studentId");

    if (academicYear) filter.academicYear = academicYear;
    if (yearOfStudy) filter.yearOfStudy = yearOfStudy;
    if (group) filter.group = group;
    if (subject) filter.subject = subject;
    if (studentId) filter.studentId = studentId;

    const assignmentMarks = await AssignmentMarks.find(filter)
      .populate("studentId", "name admissionNo")
      .sort({ "studentId.name": 1 })
      .lean();

    return NextResponse.json(assignmentMarks, { status: 200 });
  } catch (error) {
    console.error("GET Assignment Marks Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch assignment marks." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const data = await req.json();

    const {
      academicYear,
      yearOfStudy,
      group,
      subject,
      studentId,
      assignment1,
      assignment2,
      assignment3,
      assignment4,
      assignment5,
      assignment6,
      assignment7,
      assignment8,
      assignment9,
      assignment10,
    } = data;

    const marks = [
      assignment1,
      assignment2,
      assignment3,
      assignment4,
      assignment5,
      assignment6,
      assignment7,
      assignment8,
      assignment9,
      assignment10,
    ];

    const hasInvalidMarks = marks.some(
      (mark) =>
        mark !== null &&
        mark !== undefined &&
        (Number(mark) < 0 || Number(mark) > 10)
    );

    if (hasInvalidMarks) {
      return NextResponse.json(
        { error: "Assignment marks must be between 0 and 10." },
        { status: 400 }
      );
    }

    const assignmentMarks = await AssignmentMarks.findOneAndUpdate(
      {
        collegeId: session.user.collegeId,
        academicYear,
        yearOfStudy,
        group,
        subject,
        studentId,
      },
      {
        $set: {
          assignment1,
          assignment2,
          assignment3,
          assignment4,
          assignment5,
          assignment6,
          assignment7,
          assignment8,
          assignment9,
          assignment10,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json(assignmentMarks, { status: 200 });
  } catch (error) {
    console.error("POST Assignment Marks Error:", error);

    return NextResponse.json(
      { error: "Failed to save assignment marks." },
      { status: 500 }
    );
  }
}