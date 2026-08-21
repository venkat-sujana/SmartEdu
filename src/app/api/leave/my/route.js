import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import LeaveRequest from "@/models/LeaveRequest";

export async function GET() {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      session.user.role !== "student"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const requests = await LeaveRequest.find({
      studentId: session.user.id,
      collegeId: session.user.collegeId,
    })
      .sort({
        leaveDate: 1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      status: "success",
      data: requests,
    });
  } catch (error) {
    console.error(
      "Student leave history API error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to load leave requests",
      },
      { status: 500 }
    );
  }
}