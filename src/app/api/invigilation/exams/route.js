//src/app/api/invigilation/exams/route.js
import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import ExamSchedule from "@/models/ExamSchedule";
import InvigilationRoom from "@/models/InvigilationRoom";
import DutyAssignment from "@/models/DutyAssignment";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

const EXAM_TYPES = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4", "QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2"];

function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeExamType(value) {
  const normalized = String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  const aliases = {
    QUARTERLY: "QUARTERLY",
    HALFYEARLY: "HALFYEARLY",
    "HALF-YEARLY": "HALFYEARLY",
    "PREPUBLIC-1": "PRE-PUBLIC-1",
    "PREPUBLIC1": "PRE-PUBLIC-1",
    "PRE-PUBLIC-1": "PRE-PUBLIC-1",
    "PREPUBLIC-2": "PRE-PUBLIC-2",
    "PREPUBLIC2": "PRE-PUBLIC-2",
    "PRE-PUBLIC-2": "PRE-PUBLIC-2",
  };

  const [examType] = EXAM_TYPES.filter(type => type.replace(/-/g, "") === normalized);
if (examType) return examType;


  if (aliases[normalized]) return aliases[normalized];
  return normalized;
}

function formatExamLabel(examType) {
  return examType.replace(/-/g, " ");
}

function getDateRange(fromDate, toDate) {
  const dates = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(toDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}





export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin", "lecturer"]);
  if (error) return error;

  await connectInvigilationDB();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const session = searchParams.get("session");
  const examType = searchParams.get("examType");

  const filter = {};
  if (user.collegeId) {
    filter.collegeId = user.collegeId;
  }
  if (date) {
    const start = parseDateOnly(date);
    const end = parseDateOnly(date);
    if (!start || !end) {
      return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }
  if (session) filter.session = session;

if (examType) {
  filter.examType = examType
}

console.log('Exam Filter:', filter)

  const exams = await ExamSchedule.find(filter)
    .sort({ date: 1, session: 1 })
    .populate("createdBy", "name role")
    .populate("roomId", "name block capacity")
    .lean();

  return NextResponse.json({ role: user.role, data: exams });
}



export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const payload = await req.json();
    const { date, session, subject, hallNo, collegeId, examType, fromDate, toDate, roomIds } = payload;
    const resolvedCollegeId = user.collegeId || collegeId || undefined;
    const normalizedExamType = normalizeExamType(examType);

    if (!session || !normalizedExamType || !EXAM_TYPES.includes(normalizedExamType)) {
      return NextResponse.json({ message: "Valid exam type and session are required" }, { status: 400 });
    }

    if (Array.isArray(roomIds) && roomIds.length > 0 && fromDate && toDate) {
      const startDate = parseDateOnly(fromDate);
      const endDate = parseDateOnly(toDate);

      if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
        return NextResponse.json({ message: "Invalid date range" }, { status: 400 });
      }

      const rooms = await InvigilationRoom.find({
        _id: { $in: roomIds },
        ...(resolvedCollegeId ? { collegeId: resolvedCollegeId } : {}),
      }).lean();

      if (rooms.length === 0) {
        return NextResponse.json({ message: "Select at least one valid room" }, { status: 400 });
      }

      const dates = getDateRange(startDate, endDate);
      const existingSchedules = await ExamSchedule.find({
        date: { $in: dates },
        session,
        examType: normalizedExamType,
        hallNo: { $in: rooms.map((room) => room.name) },
        ...(resolvedCollegeId ? { collegeId: resolvedCollegeId } : {}),
      })
        .select("date hallNo")
        .lean();

      const existingKeys = new Set(
        existingSchedules.map((item) => `${toDateKey(item.date)}::${item.hallNo}`)
      );

      const docs = [];
      for (const room of rooms) {
        for (const scheduleDate of dates) {
          const dateKey = toDateKey(scheduleDate);
          const compositeKey = `${dateKey}::${room.name}`;

          if (existingKeys.has(compositeKey)) {
            continue;
          }

          docs.push({
            date: scheduleDate,
            session,
            examType: normalizedExamType,
            subject: subject?.trim() || formatExamLabel(normalizedExamType),
            hallNo: room.name,
            roomId: room._id,
            ...(resolvedCollegeId ? { collegeId: resolvedCollegeId } : {}),
            createdBy: user._id,
          });
        }
      }

      if (docs.length === 0) {
        return NextResponse.json({
          message: "All selected room schedules already exist for this range",
          createdCount: 0,
          skippedCount: rooms.length * dates.length,
        });
      }

      const created = await ExamSchedule.insertMany(docs, { ordered: false });

      return NextResponse.json({
        message: "Bulk exam schedule created",
        data: created,
        createdCount: created.length,
        skippedCount: rooms.length * dates.length - created.length,
      });
    }

    if (!date || !hallNo?.trim()) {
      return NextResponse.json({ message: "Date and hall are required" }, { status: 400 });
    }

    const created = await ExamSchedule.create({
      date: parseDateOnly(date),
      session,
      examType: normalizedExamType,
      subject: subject?.trim() || formatExamLabel(normalizedExamType),
      hallNo: hallNo.trim(),
      ...(resolvedCollegeId ? { collegeId: resolvedCollegeId } : {}),
      createdBy: user._id,
    });

    return NextResponse.json({ message: "Exam schedule created", data: created });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to create exam" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    const date = body?.date || "";
    const session = body?.session || "";
    const examType = body?.examType ? normalizeExamType(body.examType) : "";

    const filter = {};
    if (user.collegeId) {
      filter.collegeId = user.collegeId;
    }
    if (ids.length > 0) {
      filter._id = { $in: ids };
    }
    if (date) {
      const start = parseDateOnly(date);
      const end = parseDateOnly(date);
      if (!start || !end) {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
      }
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (session) {
      filter.session = session;
    }
    if (examType) {
      filter.examType = examType;
    }

    const schedules = await ExamSchedule.find(filter).select("_id").lean();
    console.log(
  'schedules count =',
  schedules.length
)
    if (schedules.length === 0) {
      return NextResponse.json({ message: "No exam schedules found to delete", deletedCount: 0 });
    }

    const scheduleIds = schedules.map((item) => item._id);
    await DutyAssignment.deleteMany({ examScheduleId: { $in: scheduleIds } });
    await ExamSchedule.deleteMany({ _id: { $in: scheduleIds } });

    return NextResponse.json({
      message: "Exam schedules deleted",
      deletedCount: scheduleIds.length,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to delete exam schedules" }, { status: 500 });
  }
}
