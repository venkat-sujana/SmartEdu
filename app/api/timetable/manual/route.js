import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import TimeTable from "@/models/TimeTable";
import TimeSlot from "@/models/TimeSlot";
import TimetableSubject from "@/models/TimetableSubject";
import TimetableLecturer from "@/models/TimetableLecturer";

export async function GET(req) {
  const { error } = await requireInvigilationAuth(req, ["admin", "lecturer"]);
  if (error) return error;
  await connectInvigilationDB();

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const semester = Number(searchParams.get("semester"));
  const classroom = searchParams.get("classroom");

  if (!year || !semester || !classroom) {
    return NextResponse.json({ message: "year, semester, classroom are required" }, { status: 400 });
  }

  const timetable = await TimeTable.findOne({ year, semester, classroom }).lean();
  if (!timetable) return NextResponse.json({ data: { timetable: null, slots: [] } });

  const slots = await TimeSlot.find({ timetableId: timetable._id })
    .populate("subjectId", "subjectName subjectCode")
    .populate("lecturerId", "name department")
    .sort({ day: 1, period: 1 })
    .lean();

  return NextResponse.json({ data: { timetable, slots } });
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { year, semester, classroom, day, period, subjectId, lecturerId } = await req.json();
    if (!year || !semester || !classroom || !day || !period || !subjectId || !lecturerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const subject = await TimetableSubject.findById(subjectId).lean();
    if (!subject) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    const lecturer = await TimetableLecturer.findById(lecturerId).lean();
    if (!lecturer) return NextResponse.json({ message: "Lecturer not found" }, { status: 404 });

    const clashLecturer = await TimeSlot.findOne({ day, period: Number(period), lecturerId }).lean();
    if (clashLecturer) {
      return NextResponse.json({ message: "Lecturer conflict at same day/period" }, { status: 409 });
    }

    const clashClassroom = await TimeSlot.findOne({
      day,
      period: Number(period),
      classroom,
      year: Number(year),
      semester: Number(semester),
    }).lean();
    if (clashClassroom) {
      return NextResponse.json({ message: "Classroom conflict at same day/period" }, { status: 409 });
    }

    const timetable = await TimeTable.findOneAndUpdate(
      { year: Number(year), semester: Number(semester), classroom: classroom.trim() },
      { $setOnInsert: { createdBy: user._id } },
      { upsert: true, new: true }
    );

    const slot = await TimeSlot.findOneAndUpdate(
      { timetableId: timetable._id, day, period: Number(period) },
      {
        timetableId: timetable._id,
        day,
        period: Number(period),
        subjectId,
        lecturerId,
        year: Number(year),
        semester: Number(semester),
        classroom: classroom.trim(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Time slot assigned", data: slot });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Manual assignment failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { searchParams } = new URL(req.url);
    const timetableId = searchParams.get("timetableId");
    const day = searchParams.get("day");
    const period = Number(searchParams.get("period"));
    if (!timetableId || !day || !period) {
      return NextResponse.json({ message: "timetableId, day, period are required" }, { status: 400 });
    }

    await TimeSlot.deleteOne({ timetableId, day, period });
    return NextResponse.json({ message: "Time slot removed" });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Delete failed" }, { status: 500 });
  }
}

