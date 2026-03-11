import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import DutyAssignment from "@/models/DutyAssignment";
import ExamSchedule from "@/models/ExamSchedule";
import User from "@/models/User";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

function toDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const body = await req.json().catch(() => ({}));
    const date = body?.date || "";
    const session = body?.session || "";

    const examFilter = {};
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      examFilter.date = { $gte: start, $lt: end };
    }
    if (session) {
      examFilter.session = session;
    }

    const [allExams, lecturers, existingDuties] = await Promise.all([
      ExamSchedule.find(examFilter).sort({ date: 1, session: 1 }).lean(),
      User.find({ role: "lecturer" }).select("_id name").lean(),
      DutyAssignment.find({})
        .populate("examScheduleId", "date session")
        .select("examScheduleId lecturerId")
        .lean(),
    ]);

    if (lecturers.length === 0) {
      return NextResponse.json({ message: "No lecturers available", assigned: 0, skipped: 0 });
    }

    const examAssignedSet = new Set(
      existingDuties
        .filter((d) => d.examScheduleId?._id)
        .map((d) => String(d.examScheduleId._id))
    );

    const targetExams = allExams.filter((e) => !examAssignedSet.has(String(e._id)));
    if (targetExams.length === 0) {
      return NextResponse.json({
        message: "No unassigned exams found for auto allocation",
        assigned: 0,
        skipped: 0,
      });
    }

    const loadByLecturer = new Map(lecturers.map((l) => [String(l._id), 0]));
    const clashMap = new Map(); // lecturerId -> Set(`${date}|${session}`)

    for (const d of existingDuties) {
      const lId = String(d.lecturerId);
      const exam = d.examScheduleId;
      if (!exam?.date || !exam?.session) continue;
      loadByLecturer.set(lId, (loadByLecturer.get(lId) || 0) + 1);
      const key = `${toDateKey(exam.date)}|${exam.session}`;
      if (!clashMap.has(lId)) clashMap.set(lId, new Set());
      clashMap.get(lId).add(key);
    }

    const createdAssignments = [];
    const skippedExams = [];

    for (const exam of targetExams) {
      const slotKey = `${toDateKey(exam.date)}|${exam.session}`;

      const candidates = lecturers.filter((l) => !clashMap.get(String(l._id))?.has(slotKey));
      if (candidates.length === 0) {
        skippedExams.push({
          examScheduleId: exam._id,
          reason: "No free lecturer for this date/session",
        });
        continue;
      }

      candidates.sort((a, b) => {
        const la = loadByLecturer.get(String(a._id)) || 0;
        const lb = loadByLecturer.get(String(b._id)) || 0;
        if (la !== lb) return la - lb;
        return String(a._id).localeCompare(String(b._id));
      });

      const selected = candidates[0];
      const created = await DutyAssignment.create({
        examScheduleId: exam._id,
        lecturerId: selected._id,
        assignedBy: user._id,
        availability: "Pending",
      });

      createdAssignments.push(created);
      const selectedId = String(selected._id);
      loadByLecturer.set(selectedId, (loadByLecturer.get(selectedId) || 0) + 1);
      if (!clashMap.has(selectedId)) clashMap.set(selectedId, new Set());
      clashMap.get(selectedId).add(slotKey);
    }

    return NextResponse.json({
      message: "Auto allocation completed",
      assigned: createdAssignments.length,
      skipped: skippedExams.length,
      skippedExams,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Auto allocation failed" }, { status: 500 });
  }
}

