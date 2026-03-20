import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import College from "@/models/College";
import Exam from "@/models/Exam";
import Lecturer from "@/models/Lecturer";
import Principal from "@/models/Principal";
import Student from "@/models/Student";
import { getAdminSession } from "@/lib/requireAdminSession";

const MODEL_MAP = {
  colleges: College,
  students: Student,
  lecturers: Lecturer,
  principals: Principal,
  attendance: Attendance,
  exams: Exam,
};

export async function POST(req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { entity } = await context.params;
    const Model = MODEL_MAP[entity];
    if (!Model) {
      return NextResponse.json({ error: "Unsupported entity" }, { status: 400 });
    }

    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? [...new Set(body.ids.filter((id) => mongoose.Types.ObjectId.isValid(id)))]
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "No valid record ids provided" }, { status: 400 });
    }

    await connectMongoDB();
    const result = await Model.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: `${result.deletedCount || 0} ${entity} deleted successfully`,
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    console.error("Admin bulk delete error:", error);
    return NextResponse.json({ error: error.message || "Bulk delete failed" }, { status: 500 });
  }
}
