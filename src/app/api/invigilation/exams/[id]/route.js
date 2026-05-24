import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import ExamSchedule from "@/models/ExamSchedule";
import DutyAssignment from "@/models/DutyAssignment";
import InvigilationRoom from "@/models/InvigilationRoom";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

export async function PUT(req, { params }) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { id } = params;
    const body = await req.json();

    const room = body.roomId
      ? await InvigilationRoom.findOne({
          _id: body.roomId,
          ...(user.collegeId ? { collegeId: user.collegeId } : {}),
        }).lean()
      : null;

    const update = {
      date: body.date ? new Date(body.date) : undefined,
      session: body.session,
      examType: body.examType,
      subject: body.subject?.trim() || body.examType || "",
      hallNo: room?.name || body.hallNo?.trim(),
      roomId: room?._id || undefined,
    };

    if (!update.date || !update.session || !update.examType || !update.hallNo) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const updated = await ExamSchedule.findOneAndUpdate(
      { _id: id, ...(user.collegeId ? { collegeId: user.collegeId } : {}) },
      update,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Exam schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Exam schedule updated", data: updated });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to update exam schedule" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { id } = params;

    await DutyAssignment.deleteMany({ examScheduleId: id });

    const deleted = await ExamSchedule.findOneAndDelete({
      _id: id,
      ...(user.collegeId ? { collegeId: user.collegeId } : {}),
    });

    if (!deleted) {
      return NextResponse.json({ message: "Exam schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Exam schedule deleted" });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to delete exam schedule" }, { status: 500 });
  }
}
