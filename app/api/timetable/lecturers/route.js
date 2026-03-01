import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import User from "@/models/User";
import TimetableLecturer from "@/models/TimetableLecturer";
import { hashPassword } from "@/lib/invigilation-auth";
import TimeSlot from "@/models/TimeSlot";

export async function GET(req) {
  const { error } = await requireInvigilationAuth(req, ["admin", "lecturer"]);
  if (error) return error;
  await connectInvigilationDB();

  const lecturers = await TimetableLecturer.find({}).sort({ createdAt: -1 }).lean();
  const lecturerIds = lecturers.map((l) => l._id);
  const workloadAgg = await TimeSlot.aggregate([
    { $match: { lecturerId: { $in: lecturerIds } } },
    { $group: { _id: "$lecturerId", allocatedHours: { $sum: 1 } } },
  ]);
  const workloadMap = new Map(workloadAgg.map((w) => [String(w._id), w.allocatedHours]));

  return NextResponse.json({
    data: lecturers.map((l) => ({
      ...l,
      allocatedHours: workloadMap.get(String(l._id)) || 0,
    })),
  });
}

export async function POST(req) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { name, email, department, maxHoursPerWeek, password } = await req.json();

    if (!name || !email || !department || !maxHoursPerWeek) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password?.trim() || "welcome123"),
      role: "lecturer",
    });

    const profile = await TimetableLecturer.create({
      userId: newUser._id,
      name: name.trim(),
      email: normalizedEmail,
      department: department.trim(),
      maxHoursPerWeek: Number(maxHoursPerWeek),
    });

    return NextResponse.json({ message: "Lecturer created", data: profile });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to create lecturer" }, { status: 500 });
  }
}

