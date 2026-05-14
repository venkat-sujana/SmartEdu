// app/api/timetable-builder/slots/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import TimetableSlot from "@/models/TimetableSlot";
import mongoose from "mongoose";
import { TIMETABLE_DAYS as DAYS } from "@/lib/timetable-config";

// ── GET — class timetable load చేయడం ────────────────────────────────
export async function GET(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classLabel   = searchParams.get("classLabel");
  const academicYear = searchParams.get("academicYear") || "2026-2027";

  if (!classLabel)
    return NextResponse.json({ message: "classLabel అవసరం" }, { status: 400 });

  try {
    const collegeId = new mongoose.Types.ObjectId(session.user.collegeId);

    const slots = await TimetableSlot.find({ collegeId, classLabel, academicYear })
      .sort({ day: 1, periodIndex: 1 })
      .lean();

    // Grid గా organize చేయండి: { Monday: [...slots], Tuesday: [...] }
    const grid = {};
    DAYS.forEach((day) => {
      grid[day] = slots
        .filter((s) => s.day === day)
        .sort((a, b) => a.periodIndex - b.periodIndex);
    });

    return NextResponse.json({ data: { slots, grid }, total: slots.length });

  } catch (err) {
    console.error("GET slots error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ── POST — ఒక్క slot save/update చేయడం (upsert) ────────────────────
export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const {
    classLabel, stream, academicYear = "2026-2027",
    day, periodIndex, periodLabel, periodType = "period",
    subject, lecturerName, lecturerId,
    subjectColor = "#e2e8f0", isLocked = false, isPractical = false,
  } = await req.json();

  if (!classLabel || !day || periodIndex === undefined || !periodLabel)
    return NextResponse.json({ message: "classLabel, day, periodIndex, periodLabel అవసరం" }, { status: 400 });

  try {
    const collegeId = new mongoose.Types.ObjectId(session.user.collegeId);

    // ✅ Upsert — already ఉంటే update, లేకపోతే create
    const slot = await TimetableSlot.findOneAndUpdate(
      { collegeId, classLabel, day, periodIndex, academicYear },
      {
        $set: {
          stream, periodLabel, periodType,
          subject:      subject      || "",
          lecturerName: lecturerName || "",
          lecturerId:   lecturerId   || null,
          subjectColor, isLocked, isPractical,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Slot saved ✅", data: slot });

  } catch (err) {
    console.error("POST slot error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ── DELETE — ఒక class యొక్క అన్ని slots clear చేయడం ────────────────
export async function DELETE(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classLabel   = searchParams.get("classLabel");
  const academicYear = searchParams.get("academicYear") || "2026-2027";

  if (!classLabel)
    return NextResponse.json({ message: "classLabel అవసరం" }, { status: 400 });

  try {
    const collegeId = new mongoose.Types.ObjectId(session.user.collegeId);
    const result = await TimetableSlot.deleteMany({ collegeId, classLabel, academicYear });
    return NextResponse.json({ message: `${result.deletedCount} slots cleared ✅` });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
