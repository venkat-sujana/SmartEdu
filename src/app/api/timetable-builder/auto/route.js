// app/auto/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import TimetableSlot from "@/models/TimetableSlot";
import mongoose from "mongoose";
import {
  TIMETABLE_COLUMNS as COLUMNS,
  TIMETABLE_DAYS as DAYS,
  TIMETABLE_SUBJECT_HEX_COLORS as SUBJECT_COLORS,
} from "@/lib/timetable-config";

function normalizeLecturerName(name = "") {
  return String(name).trim().replace(/\s+/g, " ").toLowerCase();
}

function getLecturerKey({ lecturerId, lecturerName }) {
  if (lecturerId) return `id:${String(lecturerId)}`;
  const normalizedName = normalizeLecturerName(lecturerName);
  return normalizedName ? `name:${normalizedName}` : null;
}

function getBusyKey(lecturerKey, day, periodIndex) {
  return `${lecturerKey}::${day}::${periodIndex}`;
}

// ── Auto-Generate Algorithm ───────────────────────────────────────────
// subjectHours: [{ subject, lecturerName, hoursPerWeek, isPractical }]
// subjectHours: [{ subject, lecturerName, lecturerId, hoursPerWeek, isPractical }]
function generateTimetable(subjectHours, { availableSlots, busyKeys }) {
  const periodsNeeded = [];
  subjectHours.forEach(({ subject, lecturerName, lecturerId, hoursPerWeek, isPractical }) => {
    for (let i = 0; i < hoursPerWeek; i++) {
      periodsNeeded.push({ subject, lecturerName, lecturerId, isPractical });
    }
  });

  for (let i = periodsNeeded.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [periodsNeeded[i], periodsNeeded[j]] = [periodsNeeded[j], periodsNeeded[i]];
  }

  const assignments = [];
  const assignedSlotKeys = new Set();
  const generatedBusyKeys = new Set(busyKeys);
  const unallocated = [];

  periodsNeeded.forEach((period) => {
    const lecturerKey = getLecturerKey(period);
    const slot = availableSlots.find((candidate) => {
      const slotKey = `${candidate.day}-${candidate.periodIndex}`;
      if (assignedSlotKeys.has(slotKey)) return false;
      if (!lecturerKey) return true;
      return !generatedBusyKeys.has(getBusyKey(lecturerKey, candidate.day, candidate.periodIndex));
    });

    if (!slot) {
      unallocated.push(period);
      return;
    }

    assignedSlotKeys.add(`${slot.day}-${slot.periodIndex}`);
    if (lecturerKey) {
      generatedBusyKeys.add(getBusyKey(lecturerKey, slot.day, slot.periodIndex));
    }

    assignments.push({
      ...slot,
      subject: period.subject,
      lecturerName: period.lecturerName,
      lecturerId: period.lecturerId || null,
      isPractical: period.isPractical,
      subjectColor: SUBJECT_COLORS[period.subject] || "#e2e8f0",
    });
  });

  return { assignments, unallocated };
}

// ── POST — Auto Generate చేయడం ───────────────────────────────────────
export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const {
    classLabel,
    stream,
    academicYear = "2026-2027",
    subjectHours,    // [{ subject, lecturerName, hoursPerWeek, isPractical }]
    overwriteLocked = false,
  } = await req.json();

  if (!classLabel || !subjectHours?.length)
    return NextResponse.json(
      { message: "classLabel మరియు subjectHours అవసరం" },
      { status: 400 }
    );

  try {
    const collegeId = new mongoose.Types.ObjectId(session.user.collegeId);

    // Locked slots తీసుకోండి (overwrite కాకూడదు)
    const lockedSlots = overwriteLocked
      ? []
      : await TimetableSlot.find({ collegeId, classLabel, academicYear, isLocked: true }).lean();

    const lockedKeys = new Set(
      lockedSlots.map((s) => `${s.day}-${s.periodIndex}`)
    );

    const availableSlots = [];
    DAYS.forEach((day) => {
      COLUMNS.forEach((col, periodIndex) => {
        const key = `${day}-${periodIndex}`;
        if (col.type === "period" && !lockedKeys.has(key)) {
          availableSlots.push({ day, periodIndex, periodLabel: col.label });
        }
      });
    });

    const existingBusySlots = await TimetableSlot.find({
      collegeId,
      academicYear,
      periodType: "period",
      subject: { $ne: "" },
      $or: [
        { lecturerId: { $ne: null } },
        { lecturerName: { $ne: "" } },
      ],
    }).lean();

    const busyKeys = new Set();
    existingBusySlots.forEach((slot) => {
      const slotKey = `${slot.day}-${slot.periodIndex}`;
      const isCurrentClass = slot.classLabel === classLabel;
      if (isCurrentClass && !lockedKeys.has(slotKey)) return;

      const lecturerKey = getLecturerKey(slot);
      if (!lecturerKey) return;
      busyKeys.add(getBusyKey(lecturerKey, slot.day, slot.periodIndex));
    });

    // Generate assignments without placing lecturers into already-busy periods.
    const { assignments, unallocated } = generateTimetable(subjectHours, {
      availableSlots,
      busyKeys,
    });

    // Break/Lunch slots కూడా save చేయాలి
    const allSlots = [];
    DAYS.forEach((day) => {
      COLUMNS.forEach((col, periodIndex) => {
        const key = `${day}-${periodIndex}`;
        if (lockedKeys.has(key)) return; // locked slots skip

        if (col.type !== "period") {
          // Break/Lunch slot
          allSlots.push({
            collegeId, classLabel, stream, academicYear,
            day, periodIndex, periodLabel: col.label, periodType: col.type,
            subject: col.label, lecturerName: "", lecturerId: null,
            subjectColor: col.type === "break" ? "#d1d5db" : "#9ca3af",
            isLocked: false, isPractical: false,
          });
          return;
        }

        // Period slot — assignment లో చూడండి
        const assignment = assignments.find(
          (a) => a.day === day && a.periodIndex === periodIndex
        );

        allSlots.push({
          collegeId, classLabel, stream, academicYear,
          day, periodIndex,
          periodLabel:  col.label,
          periodType:   "period",
          subject:      assignment?.subject      || "",
          lecturerName: assignment?.lecturerName || "",
          lecturerId:   assignment?.lecturerId   || null,
          subjectColor: assignment?.subjectColor || "#e2e8f0",
          isLocked:     false,
          isPractical:  assignment?.isPractical  || false,
        });
      });
    });

    // ✅ Bulk upsert
    const bulkOps = allSlots.map((slot) => ({
      updateOne: {
        filter: { collegeId, classLabel, day: slot.day, periodIndex: slot.periodIndex, academicYear },
        update:  { $set: slot },
        upsert:  true,
      },
    }));

    await TimetableSlot.bulkWrite(bulkOps);

    // Workload summary
    const workloadMap = {};
    allSlots
      .filter((s) => s.lecturerName && s.periodType === "period")
      .forEach((s) => {
        if (!workloadMap[s.lecturerName]) {
          workloadMap[s.lecturerName] = { theory: 0, practical: 0, total: 0 };
        }
        if (s.isPractical) workloadMap[s.lecturerName].practical++;
        else               workloadMap[s.lecturerName].theory++;
        workloadMap[s.lecturerName].total++;
      });

    return NextResponse.json({
      message:   "Timetable auto-generated ✅",
      totalSaved: allSlots.length,
      unallocated,
      workload:  Object.entries(workloadMap).map(([name, w]) => ({ name, ...w })),
    });

  } catch (err) {
    console.error("Auto-generate error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
