import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import TimetableLecturer from "@/models/TimetableLecturer";
import TimetableSubject from "@/models/TimetableSubject";
import TimeSlot from "@/models/TimeSlot";

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ["lecturer"]);
  if (error) return error;
  await connectInvigilationDB();

  const lecturer = await TimetableLecturer.findOne({ userId: user._id }).lean();
  if (!lecturer) {
    return NextResponse.json({ message: "Lecturer profile not found" }, { status: 404 });
  }

  const subjects = await TimetableSubject.find({ lecturerId: lecturer._id }).lean();
  const slots = await TimeSlot.find({ lecturerId: lecturer._id })
    .populate("subjectId", "subjectName subjectCode year semester")
    .sort({ day: 1, period: 1 })
    .lean();

  return NextResponse.json({
    data: {
      lecturer,
      subjects,
      slots,
      weeklyAllocatedHours: slots.length,
      remainingCapacity: Math.max(0, Number(lecturer.maxHoursPerWeek || 0) - slots.length),
    },
  });
}

