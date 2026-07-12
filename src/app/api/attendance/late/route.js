//src/app/api/attendance/late/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";





// GET — ఒక date కి late comers list
export async function GET(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const group = searchParams.get("group");
    const yearOfStudy = searchParams.get("yearOfStudy");

    if (!date || !group || !yearOfStudy) {
      return NextResponse.json({ status: "error", message: "Missing params" }, { status: 400 });
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    const normalizedGroup = normalizeAttendanceGroup(group);

    // ఆ class లో students
    const students = await Student.find({
      collegeId: session.user.collegeId,
      group: normalizedGroup,
      yearOfStudy,
    }).sort({ admissionNo: 1 }).lean();

    // ఆ date లో attendance records
    const records = await Attendance.find({
      collegeId: session.user.collegeId,
      group: normalizedGroup,
      yearOfStudy,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .select("studentId status lateComer lateTime markedAt session")
      .sort({ markedAt: -1, updatedAt: -1 })
      .lean();

    function getRecordPriority(record) {
      if (record?.lateComer) return 3;
      if (record?.status === "Present") return 2;
      if (record?.status === "Absent") return 1;
      return 0;
    }

    const recordMap = new Map();

    for (const record of records) {
      const studentIdKey = record.studentId?.toString();
      if (!studentIdKey) continue;

      const existingRecord = recordMap.get(studentIdKey);
      if (!existingRecord || getRecordPriority(record) > getRecordPriority(existingRecord)) {
        recordMap.set(studentIdKey, record);
      }
    }

    const data = students.map((student) => {
      const record = recordMap.get(student._id?.toString());



      return {
        studentId: student._id,
        name: student.name,
        admissionNo: student.admissionNo || "-",
        photo: student.photo || null,
        status: record?.status || "N/A",
        lateComer: record?.lateComer || false,
        lateTime: record?.lateTime || "",
      };
    });
     
     
// console.log(data);
    return NextResponse.json({ status: "success", data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error", message: "Server Error" }, { status: 500 });
  }
}





// POST — Late mark చేయి
export async function POST(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const {
  studentId,
  date,
  lateTime,
  group,
  yearOfStudy,
  session: attendanceSession = "FN",
} = await req.json();

    if (!studentId || !date) {
      return NextResponse.json({ status: "error", message: "Missing fields" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ status: "error", message: "Invalid studentId" }, { status: 400 });
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    const student = await Student.findById(studentId).lean();

if (!student) {
  return NextResponse.json(
    {
      status: "error",
      message: "Student not found",
    },
    { status: 404 }
  );
}

const attendanceDate = new Date(date);
attendanceDate.setHours(0, 0, 0, 0);

const resolvedLateTime =
  lateTime ||
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const result = await Attendance.findOneAndUpdate(
  {
    collegeId: session.user.collegeId,
    studentId: new mongoose.Types.ObjectId(studentId),
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    session: attendanceSession,
  },
  {
    $set: {
      status: "Present",
      lateComer: true,
      lateTime: resolvedLateTime,

      group: group || student.group,
      yearOfStudy: yearOfStudy || student.yearOfStudy,

      lecturerName: session.user.name,
      lecturerId: session.user.id,

      month,
      year,

      date: attendanceDate,
      markedAt: new Date(),
    },
    $setOnInsert: {
      collegeId: session.user.collegeId,
      studentId: new mongoose.Types.ObjectId(studentId),
      session: attendanceSession,
    },
  },
  {
    new: true,
    upsert: true,
  }
);

return NextResponse.json({
  status: "success",
  message: "Present + Late marked successfully",
  data: {
    studentId,
    status: result.status,
    lateComer: result.lateComer,
    lateTime: result.lateTime || resolvedLateTime,
  },
});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error", message: "Server Error" }, { status: 500 });
  }
}

// DELETE — Late unmark చేయి
export async function DELETE(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { studentId, date } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ status: "error", message: "Invalid studentId" }, { status: 400 });
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    await Attendance.findOneAndUpdate(
      {
        collegeId: session.user.collegeId,
        studentId: new mongoose.Types.ObjectId(studentId),
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      { $set: { lateComer: false, lateTime: "" } }
    );

    return NextResponse.json({ status: "success", message: "Late removed" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error", message: "Server Error" }, { status: 500 });
  }
}
