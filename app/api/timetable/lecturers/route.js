import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import User from "@/models/User";
import TimetableLecturer from "@/models/TimetableLecturer";
import { hashPassword } from "@/lib/invigilation-auth";
import TimeSlot from "@/models/TimeSlot";

function normalizeName(name = "") {
  return name.trim().replace(/\s+/g, " ");
}

async function getUniqueLoginEmail(rawName, preferredEmail) {
  const provided = String(preferredEmail || "").trim().toLowerCase();
  if (provided) {
    const exists = await User.findOne({ email: provided }).lean();
    if (exists) return null;
    return provided;
  }

  const base = normalizeName(rawName).toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || "lecturer";
  for (let i = 0; i < 10; i += 1) {
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const candidate = `${base}.${suffix}@osra.local`;
    const exists = await User.findOne({ email: candidate }).lean();
    if (!exists) return candidate;
  }
  return null;
}

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
      _id: l._id,
      userId: l.userId,
      name: l.name,
      maxHoursPerWeek: l.maxHoursPerWeek,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      allocatedHours: workloadMap.get(String(l._id)) || 0,
    })),
  });
}

export async function POST(req) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;
  try {
    await connectInvigilationDB();
    const { name, email, maxHoursPerWeek, password } = await req.json();

    if (!name || !maxHoursPerWeek) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const safeName = normalizeName(name);
    const loginEmail = await getUniqueLoginEmail(safeName, email);
    if (!loginEmail) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const newUser = await User.create({
      name: safeName,
      email: loginEmail,
      password: await hashPassword(password?.trim() || "welcome123"),
      role: "lecturer",
    });

    const profile = await TimetableLecturer.create({
      userId: newUser._id,
      name: safeName,
      email: loginEmail,
      department: "N/A",
      maxHoursPerWeek: Number(maxHoursPerWeek),
    });

    return NextResponse.json({
      message: "Lecturer created",
      data: profile,
      meta: { loginId: loginEmail },
    });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to create lecturer" }, { status: 500 });
  }
}
