// app/api/attendance/[id]/route.js
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import {
  attendanceRecordUpdateSchema,
  normalizeAttendanceSession,
} from "@/validations/attendanceValidation";

// 🔁 PUT (Update Attendance)
export async function PUT(req, context) {
  await connectMongoDB();

  // ✅ unwrap params safely (Promise లేదా direct object రెండింటికీ work అవుతుంది)
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "Missing ID", status: "error" },
      { status: 400 }
    );
  }

  const updateData = await req.json();

  try {
    const parsedUpdate = attendanceRecordUpdateSchema.safeParse(updateData);

    if (!parsedUpdate.success) {
      return NextResponse.json(
        {
          message: parsedUpdate.error.issues[0]?.message || "Invalid attendance update",
          status: "error",
        },
        { status: 400 }
      );
    }

    const sanitizedUpdate = { ...parsedUpdate.data };
    const updatePayload = { ...sanitizedUpdate };

    if (sanitizedUpdate.session !== undefined) {
      updatePayload.session = normalizeAttendanceSession(sanitizedUpdate.session);
    }

    if (sanitizedUpdate.date) {
      const dateObj = new Date(sanitizedUpdate.date);
      updatePayload.date = dateObj;
      updatePayload.month = dateObj.getMonth() + 1;
      updatePayload.year = dateObj.getFullYear();
    }

    const updated = await Attendance.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Attendance not found", status: "error" },
        { status: 404 }
      );
    }

    console.log("Updating ID:", id);
    console.log("Update Data:", updateData);

    return NextResponse.json({
      message: "Attendance updated",
      data: updated,
      status: "success",
    });
  } catch (err) {
    console.error("PUT Error:", err);
    return NextResponse.json(
      { message: "Error updating attendance", status: "error" },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE (Delete Attendance)
export async function DELETE(req, context) {
  await connectMongoDB();

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "Missing ID", status: "error" },
      { status: 400 }
    );
  }

  try {
    const deleted = await Attendance.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Attendance not found", status: "error" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Attendance deleted",
      status: "success",
    });
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json(
      { message: "Error deleting attendance", status: "error" },
      { status: 500 }
    );
  }
}
