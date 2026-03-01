import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import TimetableSubject from "@/models/TimetableSubject";
import TimetableLecturer from "@/models/TimetableLecturer";

export async function GET(req) {
  const { error } = await requireInvigilationAuth(req, ["admin", "lecturer"]);
  if (error) return error;
  await connectInvigilationDB();
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const semester = searchParams.get("semester");

  const filter = {};
  if (year) filter.year = Number(year);
  if (semester) filter.semester = Number(semester);

  const data = await TimetableSubject.find(filter)
    .populate("lecturerId", "name department email maxHoursPerWeek")
    .sort({ year: 1, semester: 1, subjectName: 1 })
    .lean();

  return NextResponse.json({ data });
}

export async function POST(req) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { subjectName, subjectCode, year, semester, hoursPerWeek, lecturerId } = await req.json();

    if (!subjectName || !subjectCode || !year || !semester || !hoursPerWeek || !lecturerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const code = subjectCode.trim().toUpperCase();
    const duplicate = await TimetableSubject.findOne({ subjectCode: code });
    if (duplicate) {
      return NextResponse.json({ message: "Duplicate subject code is not allowed" }, { status: 409 });
    }

    const lecturer = await TimetableLecturer.findById(lecturerId);
    if (!lecturer) {
      return NextResponse.json({ message: "Invalid lecturer" }, { status: 404 });
    }

    const created = await TimetableSubject.create({
      subjectName: subjectName.trim(),
      subjectCode: code,
      year: Number(year),
      semester: Number(semester),
      hoursPerWeek: Number(hoursPerWeek),
      lecturerId,
    });

    return NextResponse.json({ message: "Subject created", data: created });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to create subject" }, { status: 500 });
  }
}

