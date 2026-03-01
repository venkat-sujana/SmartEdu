import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import ExamSchedule from "@/models/ExamSchedule";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin", "lecturer"]);
  if (error) return error;

  await connectInvigilationDB();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const session = searchParams.get("session");

  const filter = {};
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }
  if (session) filter.session = session;

  const exams = await ExamSchedule.find(filter)
    .sort({ date: 1, session: 1 })
    .populate("createdBy", "name role")
    .lean();

  return NextResponse.json({ role: user.role, data: exams });
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { date, session, subject, hallNo } = await req.json();
    if (!date || !session || !subject || !hallNo) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const created = await ExamSchedule.create({
      date: new Date(date),
      session,
      subject: subject.trim(),
      hallNo: hallNo.trim(),
      createdBy: user._id,
    });
    return NextResponse.json({ message: "Exam schedule created", data: created });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to create exam" }, { status: 500 });
  }
}

