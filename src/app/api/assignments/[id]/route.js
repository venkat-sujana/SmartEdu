//src/app/api/assignments/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectMongoDB from "@/lib/mongodb";
import AssignmentMarks from "@/models/AssignmentMarks";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid assignment ID." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const assignment = await Assignment.findOne({
      _id: id,
      collegeId: session.user.collegeId,
    }).lean();

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    console.error("GET Assignment Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch assignment." },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid assignment ID." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const data = await req.json();

    const allowedFields = [
      "academicYear",
      "yearOfStudy",
      "group",
      "subject",
      "title",
      "description",
      "assignmentType",
      "dueDate",
      "maxMarks",
      "attachmentUrl",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: id,
        collegeId: session.user.collegeId,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    console.error("PATCH Assignment Error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          error:
            "An assignment with the same title already exists for this group and subject.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update assignment." },
      { status: 500 }
    );
  }
}
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid assignment ID." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const assignment = await Assignment.findOneAndDelete({
      _id: id,
      collegeId: session.user.collegeId,
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Assignment deleted successfully.",
        id: assignment._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Assignment Error:", error);

    return NextResponse.json(
      { error: "Failed to delete assignment." },
      { status: 500 }
    );
  }
}