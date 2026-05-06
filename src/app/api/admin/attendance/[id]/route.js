import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { createAuditLog } from "@/lib/auditLog";
import { getAdminSession } from "@/lib/requireAdminSession";

function normalizeSession(value) {
  return value === "AN" ? "AN" : "FN";
}

function isValidDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export async function PUT(req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid attendance id" }, { status: 400 });
    }

    const existing = await Attendance.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    const body = await req.json();
    const collegeId = body.collegeId || String(existing.collegeId);
    const studentId = body.studentId || String(existing.studentId);
    const dateValue = body.date || existing.date;
    const sessionValue = normalizeSession(body.session || existing.session);

    if (!mongoose.Types.ObjectId.isValid(collegeId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid collegeId or studentId" }, { status: 400 });
    }

    if (!isValidDate(dateValue)) {
      return NextResponse.json({ error: "Invalid attendance date" }, { status: 400 });
    }

    const student = await Student.findOne({ _id: studentId, collegeId }).lean();
    if (!student) {
      return NextResponse.json({ error: "Student not found for selected college" }, { status: 404 });
    }

    const date = new Date(dateValue);
    const duplicate = await Attendance.findOne({
      _id: { $ne: id },
      studentId,
      date,
      session: sessionValue,
    }).lean();

    if (duplicate) {
      return NextResponse.json({ error: "Attendance already exists for this student/date/session" }, { status: 409 });
    }

    const update = {
      collegeId,
      studentId,
      date,
      session: sessionValue,
      status: body.status || existing.status,
      group: student.group,
      yearOfStudy: student.yearOfStudy,
      lecturerName: body.lecturerName?.trim() ?? existing.lecturerName ?? "",
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };

    const updated = await Attendance.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("studentId", "name admissionNo group yearOfStudy")
      .populate("collegeId", "name");

    await createAuditLog({
      session,
      req,
      action: "update",
      entity: "attendance",
      entityId: id,
      message: `Updated attendance for ${updated?.studentId?.name || "student"} on ${date.toISOString().slice(0, 10)} ${sessionValue}`,
      before: existing,
      after: updated?.toObject?.() || updated,
      metadata: {
        studentId,
        collegeId,
      },
    });

    return NextResponse.json({ message: "Attendance updated", data: updated });
  } catch (error) {
    console.error("Admin attendance PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update attendance" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid attendance id" }, { status: 400 });
    }

    const existing = await Attendance.findById(id)
      .populate("studentId", "name admissionNo group yearOfStudy")
      .populate("collegeId", "name")
      .lean();
    if (!existing) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    await createAuditLog({
      session,
      req,
      action: "delete",
      entity: "attendance",
      entityId: id,
      message: `Deleted attendance for ${existing?.studentId?.name || "student"} on ${new Date(existing.date).toISOString().slice(0, 10)} ${existing.session}`,
      before: existing,
      metadata: {
        studentId: existing?.studentId?._id || existing?.studentId,
        collegeId: existing?.collegeId?._id || existing?.collegeId,
      },
    });

    return NextResponse.json({ message: "Attendance deleted" });
  } catch (error) {
    console.error("Admin attendance DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}
