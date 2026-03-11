import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import TimeTable from "@/models/TimeTable";
import TimeSlot from "@/models/TimeSlot";
import TimetableSubject from "@/models/TimetableSubject";
import TimetableLecturer from "@/models/TimetableLecturer";
import { generateTimetable } from "@/lib/timetable-auto";

function slotKey(day, period) {
  return `${day}|${period}`;
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { year, semester, classroom } = await req.json();
    if (!year || !semester || !classroom) {
      return NextResponse.json({ message: "year, semester, classroom are required" }, { status: 400 });
    }

    const subjects = await TimetableSubject.find({ year: Number(year), semester: Number(semester) })
      .populate("lecturerId", "maxHoursPerWeek")
      .lean();
    if (subjects.length === 0) {
      return NextResponse.json({ message: "No subjects found for selected year/semester" }, { status: 404 });
    }

    const lecturerIds = Array.from(
      new Set(subjects.map((s) => String(s.lecturerId?._id || s.lecturerId)))
    );
    const lecturers = await TimetableLecturer.find({ _id: { $in: lecturerIds } }).lean();
    const lecturerMaxHours = new Map(lecturers.map((l) => [String(l._id), Number(l.maxHoursPerWeek)]));

    const existingSlots = await TimeSlot.find({ lecturerId: { $in: lecturerIds } }).lean();
    const existingLecturerBusySlots = new Map();
    for (const slot of existingSlots) {
      const lId = String(slot.lecturerId);
      if (!existingLecturerBusySlots.has(lId)) existingLecturerBusySlots.set(lId, new Set());
      existingLecturerBusySlots.get(lId).add(slotKey(slot.day, slot.period));
    }

    const generated = generateTimetable({
      subjects,
      existingLecturerBusySlots,
      lecturerMaxHours,
    });

    const timetable = await TimeTable.findOneAndUpdate(
      { year: Number(year), semester: Number(semester), classroom: classroom.trim() },
      { $setOnInsert: { createdBy: user._id } },
      { upsert: true, new: true }
    );

    await TimeSlot.deleteMany({ timetableId: timetable._id });
    if (generated.assigned.length > 0) {
      await TimeSlot.insertMany(
        generated.assigned.map((s) => ({
          timetableId: timetable._id,
          day: s.day,
          period: s.period,
          subjectId: s.subjectId,
          lecturerId: s.lecturerId,
          year: Number(year),
          semester: Number(semester),
          classroom: classroom.trim(),
        }))
      );
    }

    const slots = await TimeSlot.find({ timetableId: timetable._id })
      .populate("subjectId", "subjectName")
      .populate("lecturerId", "name")
      .sort({ day: 1, period: 1 })
      .lean();

    return NextResponse.json({
      message: "Automatic timetable generated",
      data: {
        timetable,
        slots,
        unallocatedSubjects: generated.remainingHours.filter((r) => r.remaining > 0),
      },
    });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Auto generation failed" }, { status: 500 });
  }
}
