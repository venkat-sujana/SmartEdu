// app/api/timetable-builder/conflicts/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import TimetableSlot from "@/models/TimetableSlot";
import mongoose from "mongoose";

// ── GET — Conflicts + Workload report ────────────────────────────────
//
// Conflict = ఒక lecturer కి same day + same periodIndex లో
//            రెండు వేరే classes లో slots ఉండటం
//
export async function GET(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const academicYear = searchParams.get("academicYear") || "2026-2027";

  try {
    const collegeId = new mongoose.Types.ObjectId(session.user.collegeId);

    // అన్ని period slots fetch చేయండి (break/lunch skip)
    const slots = await TimetableSlot.find({
      collegeId,
      academicYear,
      periodType: "period",
      lecturerName: { $ne: "" },
    }).lean();

    // ── Conflict Detection ────────────────────────────────────────────
    // Key: lecturer + day + periodIndex → రెండు classes ఉంటే conflict
    const slotMap = {}; // key → [slot, slot, ...]
    slots.forEach((slot) => {
      const key = `${slot.lecturerName}::${slot.day}::${slot.periodIndex}`;
      if (!slotMap[key]) slotMap[key] = [];
      slotMap[key].push(slot);
    });

    const conflicts = [];
    Object.entries(slotMap).forEach(([key, group]) => {
      if (group.length > 1) {
        // Conflict! ఒక lecturer కి same time లో రెండు classes
        const [lecturerName, day, periodIndex] = key.split("::");
        conflicts.push({
          lecturerName,
          day,
          periodIndex: Number(periodIndex),
          periodLabel: group[0].periodLabel,
          classes:     group.map((s) => ({
            classLabel: s.classLabel,
            subject:    s.subject,
            slotId:     s._id,
          })),
        });
      }
    });

    // ── Workload Report ───────────────────────────────────────────────
    // Per lecturer: theory + practical + total per week (all classes కలిపి)
    const workloadMap = {};
    slots.forEach((slot) => {
      const name = slot.lecturerName;
      if (!workloadMap[name]) {
        workloadMap[name] = { name, theory: 0, practical: 0, total: 0 };
      }
      if (slot.isPractical) workloadMap[name].practical++;
      else                   workloadMap[name].theory++;
      workloadMap[name].total++;
    });

    const workload = Object.values(workloadMap).sort((a, b) => b.total - a.total);

    // Status: Normal (16-18), Underload (<16), Overload (>18)
    const workloadWithStatus = workload.map((w) => ({
      ...w,
      status:
        w.total < 16 ? "Underload"
        : w.total > 18 ? "Overload"
        : "Normal",
    }));

    // ── Class-wise summary ────────────────────────────────────────────
    const classMap = {};
    slots.forEach((slot) => {
      if (!classMap[slot.classLabel]) {
        classMap[slot.classLabel] = { classLabel: slot.classLabel, filled: 0, empty: 0 };
      }
      if (slot.subject) classMap[slot.classLabel].filled++;
      else              classMap[slot.classLabel].empty++;
    });

    return NextResponse.json({
      data: {
        conflicts,
        workload:    workloadWithStatus,
        classSummary: Object.values(classMap),
        totalConflicts: conflicts.length,
      },
    });

  } catch (err) {
    console.error("Conflicts API error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
