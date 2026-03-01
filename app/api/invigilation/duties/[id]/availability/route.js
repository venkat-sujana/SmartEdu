import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import DutyAssignment from "@/models/DutyAssignment";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

export async function PATCH(req, { params }) {
  const { user, error } = await requireInvigilationAuth(req, ["lecturer"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { id } = await params;
    const { availability } = await req.json();

    if (!["Available", "Not Available"].includes(availability)) {
      return NextResponse.json({ message: "Invalid availability status" }, { status: 400 });
    }

    const duty = await DutyAssignment.findById(id);
    if (!duty) {
      return NextResponse.json({ message: "Duty not found" }, { status: 404 });
    }
    if (String(duty.lecturerId) !== String(user._id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    duty.availability = availability;
    await duty.save();

    return NextResponse.json({ message: "Availability updated", data: duty });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Update failed" }, { status: 500 });
  }
}

