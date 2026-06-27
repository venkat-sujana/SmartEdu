// app/api/timetable-builder/conflicts/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import TimetableSlot from "@/models/TimetableSlot";
import mongoose from "mongoose";

function normalizeLecturerName(name = "") {
  return String(name).trim().replace(/\s+/g, " ").toLowerCase();
}

function getLecturerIdentity(slot) {
  if (slot.lecturerId) {
    return {
      key: `id:${String(slot.lecturerId)}`,
      type: "lecturerId",
      lecturerId: slot.lecturerId,
      lecturerName: slot.lecturerName || "Unknown lecturer",
    };
  }

  const normalizedName = normalizeLecturerName(slot.lecturerName);
  if (!normalizedName) return null;

  return {
    key: `name:${normalizedName}`,
    type: "lecturerName",
    lecturerId: null,
    lecturerName: slot.lecturerName,
  };
}

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
      subject: { $ne: "" },
      $or: [
        { lecturerId: { $ne: null } },
        { lecturerName: { $ne: "" } },
      ],
    }).lean();

    // ── Conflict Detection ────────────────────────────────────────────
    // Key: lecturer + day + periodIndex → రెండు classes ఉంటే conflict
    const slotMap = {}; // key → [slot, slot, ...]
    slots.forEach((slot) => {
      const identity = getLecturerIdentity(slot);
      if (!identity) return;
      const key = `${identity.key}::${slot.day}::${slot.periodIndex}`;
      if (!slotMap[key]) slotMap[key] = [];
      slotMap[key].push(slot);
    });

    const conflicts = [];
    Object.entries(slotMap).forEach(([key, group]) => {
      const uniqueClasses = new Set(group.map((slot) => slot.classLabel));
      if (uniqueClasses.size > 1) {
        // Conflict! ఒక lecturer కి same time లో రెండు classes
        const [, day, periodIndex] = key.split("::");
        const identity = getLecturerIdentity(group[0]);
        conflicts.push({
          lecturerKey: identity.key,
          lecturerKeyType: identity.type,
          lecturerId: identity.lecturerId,
          lecturerName: identity.lecturerName,
          day,
          periodIndex: Number(periodIndex),
          periodLabel: group[0].periodLabel,
          classes:     group.map((s) => ({
            classLabel: s.classLabel,
            subject:    s.subject,
            lecturerId: s.lecturerId,
            slotId:     s._id,
          })),
        });
      }
    });

    // ── Workload Report ───────────────────────────────────────────────
    // Per lecturer: theory + practical + total per week (all classes కలిపి)
    const workloadMap = {};
    slots.forEach((slot) => {
      const identity = getLecturerIdentity(slot);
      if (!identity) return;
      if (!workloadMap[identity.key]) {

        workloadMap[identity.key] = {
  lecturerKey: identity.key,
  lecturerKeyType: identity.type,
  lecturerId: identity.lecturerId,
  name: identity.lecturerName,

  // 👇 కొత్తది
  subject: slot.subject,

  theory: 0,
  practical: 0,
  total: 0,
};

      }
      if (slot.isPractical) workloadMap[identity.key].practical++;
      else                   workloadMap[identity.key].theory++;
      workloadMap[identity.key].total++;
    });

    const workload = Object.values(workloadMap).sort((a, b) => b.total - a.total);

    // Status: Normal (16-18), Underload (<16), Overload (>18)
    const SUBJECT_WORKLOAD = {
  Mathematics: 12,
  Maths: 12,

  Physics: 11,
  Chemistry: 11,

  Botany: 6,
  Zoology: 6,

  History: 11,
  Commerce: 11,
  Economics: 11,
  Civics: 11,

  English: 14,
}

const workloadWithStatus = workload.map((w) => {

  const expected = SUBJECT_WORKLOAD[w.subject] ?? 18

  return {
    ...w,
    expected,
    status:
      w.total < expected
        ? "Underload"
        : w.total > expected
        ? "Overload"
        : "Normal",
  }
})

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
