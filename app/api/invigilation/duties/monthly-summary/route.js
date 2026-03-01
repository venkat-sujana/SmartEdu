import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import DutyAssignment from "@/models/DutyAssignment";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ["lecturer", "admin"]);
  if (error) return error;

  await connectInvigilationDB();
  const { searchParams } = new URL(req.url);
  const lecturerId = searchParams.get("lecturerId");

  const targetLecturerId = user.role === "lecturer" ? String(user._id) : lecturerId;
  if (!targetLecturerId) {
    return NextResponse.json({ message: "lecturerId is required for admin summary" }, { status: 400 });
  }

  const duties = await DutyAssignment.find({ lecturerId: targetLecturerId })
    .populate("examScheduleId")
    .lean();

  const summary = {};
  for (const duty of duties) {
    const examDate = duty.examScheduleId?.date ? new Date(duty.examScheduleId.date) : null;
    if (!examDate) continue;
    const key = `${examDate.getFullYear()}-${String(examDate.getMonth() + 1).padStart(2, "0")}`;
    if (!summary[key]) {
      summary[key] = { total: 0, available: 0, notAvailable: 0, pending: 0 };
    }
    summary[key].total += 1;
    if (duty.availability === "Available") summary[key].available += 1;
    else if (duty.availability === "Not Available") summary[key].notAvailable += 1;
    else summary[key].pending += 1;
  }

  const rows = Object.entries(summary)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([month, value]) => ({ month, ...value }));

  return NextResponse.json({ data: rows });
}

