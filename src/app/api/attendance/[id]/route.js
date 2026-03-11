// app/api/attendance/[id]/route.js
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";

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
    const dateObj = new Date(updateData.date);
    const month = dateObj.toLocaleString("default", { month: "long" });
    const year = dateObj.getFullYear();

    const updated = await Attendance.findByIdAndUpdate(
      id,
      {
        ...updateData,
        date: dateObj,
        month,
        year,
      },
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
