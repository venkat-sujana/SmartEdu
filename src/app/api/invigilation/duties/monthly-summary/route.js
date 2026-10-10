import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import DutyAssignment from "@/models/DutyAssignment";
import { requireOsraAuth } from "@/lib/osra-api-guard";
import LecturerUserMapping from "@/models/LecturerUserMapping";
import User from "@/models/User";
export async function GET(req) {
  const { user, error } = await requireOsraAuth(req, ["lecturer", "admin"]);
  if (error) return error;

  await connectInvigilationDB();
  const { searchParams } = new URL(req.url);
  const lecturerId = searchParams.get("lecturerId");

  
let targetLecturerId = lecturerId;

if (user.role === "lecturer") {
  const accountFilters = [];
  if (user.email) {
    accountFilters.push({
      email: user.email.trim().toLowerCase(),
    });
  }
  if (user.name?.trim()) {
    accountFilters.push({ name: user.name.trim() });
  }

  const [mappings, matchingUsers] = await Promise.all([
    LecturerUserMapping.find({
      $or: [
        { lecturerId: user.id },
        { userId: user.id },
      ],
    }).lean(),
    accountFilters.length > 0
      ? User.find({
          role: "lecturer",
          ...(user.collegeId ? { collegeId: user.collegeId } : {}),
          $or: accountFilters,
        })
          .select("_id")
          .lean()
      : [],
  ]);

  const lecturerIds = [
    user.id,
    ...matchingUsers.map((matchingUser) => matchingUser._id.toString()),
    ...mappings.flatMap((mapping) => [
      mapping.lecturerId?.toString(),
      mapping.userId?.toString(),
    ]),
  ].filter(Boolean);

  targetLecturerId = {
    $in: [...new Set(lecturerIds)],
  };
}

if (!targetLecturerId) {
  return NextResponse.json(
    { message: "lecturerId is required for admin summary" },
    { status: 400 }
  );
}


  const duties = await DutyAssignment.find({ lecturerId: targetLecturerId })
    .populate("examScheduleId")
    .lean();

  const summary = {};
  for (const duty of duties) {
    const examDate = duty.examScheduleId?.date ? new Date(duty.examScheduleId.date) : null;
    if (!examDate) continue;
    const key = `${examDate.getFullYear()}-${String(examDate.getMonth() + 1).padStart(2, "0")}`;
    if (!summary[key]) {
      summary[key] = { total: 0, available: 0, notAvailable: 0, pending: 0 };
    }
    summary[key].total += 1;
    if (duty.availability === "Available") summary[key].available += 1;
    else if (duty.availability === "Not Available") summary[key].notAvailable += 1;
    else summary[key].pending += 1;
  }

  const rows = Object.entries(summary)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([month, value]) => ({ month, ...value }));

  return NextResponse.json({ data: rows });
}

