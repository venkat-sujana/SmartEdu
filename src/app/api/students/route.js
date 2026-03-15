import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { getStudentsService } from "@/services/studentService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
// Rate limiting removed to fix registration issue

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.collegeId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const groupParam = searchParams.get("group");
    const yearParam =
      searchParams.get("year") || searchParams.get("yearOfStudy");

    const searchParam = (searchParams.get("search") || "").trim();

    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20"), 1),
      100
    );

    const result = await getStudentsService({
      collegeId: session.user.collegeId,
      groupParam,
      yearParam,
      searchParam,
      page,
      limit,
      session
    });

    return NextResponse.json({
      status: "success",
      totalStudents: result.totalStudents,
      page,
      limit,
      totalPages: result.totalPages,
      data: result.students
    });
  } catch (error) {
    return handleApiError(error);
  }
}
