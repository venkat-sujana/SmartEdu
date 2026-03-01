import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import TimetableSubject from "@/models/TimetableSubject";

export async function PATCH(req, { params }) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { id } = await params;
    const body = await req.json();

    const subject = await TimetableSubject.findById(id);
    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    if (body.subjectName) subject.subjectName = body.subjectName.trim();
    if (body.subjectCode) subject.subjectCode = body.subjectCode.trim().toUpperCase();
    if (body.year) subject.year = Number(body.year);
    if (body.semester) subject.semester = Number(body.semester);
    if (body.hoursPerWeek) subject.hoursPerWeek = Number(body.hoursPerWeek);
    if (body.lecturerId) subject.lecturerId = body.lecturerId;
    await subject.save();

    return NextResponse.json({ message: "Subject updated", data: subject });
  } catch (err) {
    if (String(err.message || "").includes("duplicate key")) {
      return NextResponse.json({ message: "Duplicate subject code is not allowed" }, { status: 409 });
    }
    return NextResponse.json({ message: err.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { id } = await params;
    await TimetableSubject.deleteOne({ _id: id });
    return NextResponse.json({ message: "Subject deleted" });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Delete failed" }, { status: 500 });
  }
}

