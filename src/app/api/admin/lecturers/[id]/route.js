import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import College from "@/models/College";
import { getAdminSession } from "@/lib/requireAdminSession";

export async function PUT(req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { id } = await context.params;
    const body = await req.json();

    const update = {
      name: body.name?.trim(),
      email: body.email?.trim().toLowerCase(),
      subject: body.subject,
      photo: body.photo || "",
    };

    if (body.collegeId) {
      const college = await College.findById(body.collegeId).lean();
      if (!college) {
        return NextResponse.json({ error: "Invalid college" }, { status: 400 });
      }
      update.collegeId = body.collegeId;
      update.collegeName = college.name;
    }

    if (body.password?.trim()) {
      update.password = await bcrypt.hash(body.password.trim(), 10);
    }

    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const updated = await Lecturer.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("collegeId", "name");

    if (!updated) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Lecturer updated", data: updated });
  } catch (error) {
    console.error("Admin lecturers PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update lecturer" }, { status: 500 });
  }
}

export async function DELETE(_req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { id } = await context.params;
    const deleted = await Lecturer.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Lecturer deleted" });
  } catch (error) {
    console.error("Admin lecturers DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete lecturer" }, { status: 500 });
  }
}
