// app/auto/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import TimetableSlot from "@/models/TimetableSlot";
import mongoose from "mongoose";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const COLUMNS = [
  { label: "9:10 - 10:00",  type: "period" },
  { label: "10:00 - 10:50", type: "period" },
  { label: "BREAK",         type: "break"  },
  { label: "11:00 - 11:50", type: "period" },
  { label: "11:50 - 12:40", type: "period" },
  { label: "LUNCH",         type: "lunch"  },
  { label: "1:20 - 2:10",   type: "period" },
  { label: "2:10 - 3:00",   type: "period" },
  { label: "3:10 - 4:00",   type: "period" },
  { label: "4:00 - 5:00",   type: "period" },
];

// ── Subject color map (UI కోసం) ──────────────────────────────────────
const SUBJECT_COLORS = {
  "Maths":               "#dbeafe",
  "Physics":             "#fef3c7",
  "Chemistry":           "#d1fae5",
  "Botany":              "#dcfce7",
  "Zoology":             "#f0fdf4",
  "Civics":              "#fae8ff",
  "Economics":           "#ffe4e6",
  "History":             "#fff7ed",
  "Commerce":            "#fefce8",
  "English":             "#f0f9ff",
  "Telugu":              "#fdf4ff",
  "Sanskrit":            "#fef9c3",
  "Hindi":               "#fce7f3",
  "Study Hour":          "#f1f5f9",
  "GFC":                 "#ecfdf5",
  "Physics Practicals":  "#fde68a",
  "Chemistry Practicals":"#a7f3d0",
  "Botany Practicals":   "#6ee7b7",
  "Zoology Practicals":  "#86efac",
};

// ── Auto-Generate Algorithm ───────────────────────────────────────────
// subjectHours: [{ subject, lecturerName, hoursPerWeek, isPractical }]
function generateTimetable(subjectHours) {
  // Step 1: Expand subjects into individual period slots needed
  const periodsNeeded = [];
  subjectHours.forEach(({ subject, lecturerName, hoursPerWeek, isPractical }) => {
    for (let i = 0; i < hoursPerWeek; i++) {
      periodsNeeded.push({ subject, lecturerName, isPractical });
    }
  });

  // Step 2: Shuffle for randomness
  for (let i = periodsNeeded.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [periodsNeeded[i], periodsNeeded[j]] = [periodsNeeded[j], periodsNeeded[i]];
  }

  // Step 3: Only period slots (skip break/lunch)
  const periodSlots = []; // [{ day, periodIndex }]
  DAYS.forEach((day) => {
    COLUMNS.forEach((col, pIndex) => {
      if (col.type === "period") {
        periodSlots.push({ day, periodIndex: pIndex, periodLabel: col.label });
      }
    });
  });

  // Step 4: Assign periods → slots
  const assignments = [];
  let pIdx = 0;

  periodsNeeded.forEach((period) => {
    if (pIdx >= periodSlots.length) return; // slots exhausted

    // Skip already assigned slot (shouldn't happen with fresh generate)
    const slot = periodSlots[pIdx];
    assignments.push({
      ...slot,
      subject:      period.subject,
      lecturerName: period.lecturerName,
      isPractical:  period.isPractical,
      subjectColor: SUBJECT_COLORS[period.subject] || "#e2e8f0",
    });

    pIdx++;
  });

  // Step 5: Fill remaining slots as empty
  for (; pIdx < periodSlots.length; pIdx++) {
    const slot = periodSlots[pIdx];
    assignments.push({
      ...slot,
      subject:      "",
      lecturerName: "",
      isPractical:  false,
      subjectColor: "#e2e8f0",
    });
  }

  return assignments;
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

    // Generate assignments
    const assignments = generateTimetable(subjectHours);

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
          lecturerId:   null,
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
      workload:  Object.entries(workloadMap).map(([name, w]) => ({ name, ...w })),
    });

  } catch (err) {
    console.error("Auto-generate error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
