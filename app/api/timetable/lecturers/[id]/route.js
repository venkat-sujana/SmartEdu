import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import TimetableLecturer from "@/models/TimetableLecturer";
import User from "@/models/User";

export async function PATCH(req, { params }) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { id } = await params;
    const { name, department, maxHoursPerWeek } = await req.json();
    const lecturer = await TimetableLecturer.findById(id);
    if (!lecturer) {
      return NextResponse.json({ message: "Lecturer not found" }, { status: 404 });
    }

    if (name) lecturer.name = name.trim();
    if (department) lecturer.department = department.trim();
    if (maxHoursPerWeek) lecturer.maxHoursPerWeek = Number(maxHoursPerWeek);
    await lecturer.save();

    if (name) {
      await User.findByIdAndUpdate(lecturer.userId, { name: lecturer.name });
    }

    return NextResponse.json({ message: "Lecturer updated", data: lecturer });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { id } = await params;
    const lecturer = await TimetableLecturer.findById(id);
    if (!lecturer) {
      return NextResponse.json({ message: "Lecturer not found" }, { status: 404 });
    }

    await TimetableLecturer.deleteOne({ _id: id });
    await User.deleteOne({ _id: lecturer.userId });

    return NextResponse.json({ message: "Lecturer deleted" });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Delete failed" }, { status: 500 });
  }
}

