import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import DutyAssignment from "@/models/DutyAssignment";
import ExamSchedule from "@/models/ExamSchedule";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin", "lecturer"]);
  if (error) return error;

  await connectInvigilationDB();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const lecturerId = searchParams.get("lecturerId");
  const session = searchParams.get("session");

  const filter = {};
  if (user.role === "lecturer") {
    filter.lecturerId = user._id;
  } else if (lecturerId) {
    filter.lecturerId = lecturerId;
  }

  const duties = await DutyAssignment.find(filter)
    .populate("lecturerId", "name email")
    .populate("assignedBy", "name")
    .populate("examScheduleId")
    .sort({ createdAt: -1 })
    .lean();

  const filtered = duties.filter((d) => {
    const exam = d.examScheduleId;
    if (!exam) return false;

    let matches = true;
    if (date) {
      const d1 = new Date(exam.date).toISOString().slice(0, 10);
      matches = matches && d1 === date;
    }
    if (session) {
      matches = matches && exam.session === session;
    }
    return matches;
  });

  return NextResponse.json({ data: filtered });
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { examScheduleId, lecturerId } = await req.json();
    if (!examScheduleId || !lecturerId) {
      return NextResponse.json({ message: "Exam and lecturer are required" }, { status: 400 });
    }

    const exam = await ExamSchedule.findById(examScheduleId);
    if (!exam) {
      return NextResponse.json({ message: "Exam schedule not found" }, { status: 404 });
    }

    const lecturerExisting = await DutyAssignment.find({ lecturerId })
      .populate("examScheduleId", "date session")
      .lean();

    const examDate = new Date(exam.date).toISOString().slice(0, 10);
    const hasClash = lecturerExisting.some((d) => {
      const dExam = d.examScheduleId;
      if (!dExam?.date) return false;
      const dDate = new Date(dExam.date).toISOString().slice(0, 10);
      return dDate === examDate && dExam.session === exam.session;
    });

    if (hasClash) {
      return NextResponse.json(
        { message: "Lecturer already has duty in same date and session" },
        { status: 409 }
      );
    }

    const created = await DutyAssignment.create({
      examScheduleId,
      lecturerId,
      assignedBy: user._id,
      availability: "Pending",
    });

    return NextResponse.json({ message: "Duty assigned", data: created });
  } catch (err) {
    if (String(err.message || "").includes("duplicate key")) {
      return NextResponse.json({ message: "Duty already assigned to this lecturer" }, { status: 409 });
    }
    return NextResponse.json({ message: err.message || "Failed to assign duty" }, { status: 500 });
  }
}
