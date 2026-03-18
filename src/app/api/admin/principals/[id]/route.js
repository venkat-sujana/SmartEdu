import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Principal from "@/models/Principal";
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
      photo: body.photo || "",
      dateOfJoining: body.dateOfJoining || undefined,
    };

    if (body.collegeId) {
      const college = await College.findById(body.collegeId).lean();
      if (!college) {
        return NextResponse.json({ error: "Invalid college" }, { status: 400 });
      }
      update.collegeId = body.collegeId;
    }

    if (body.password?.trim()) {
      update.password = await bcrypt.hash(body.password.trim(), 10);
    }

    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const updated = await Principal.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("collegeId", "name");

    if (!updated) {
      return NextResponse.json({ error: "Principal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Principal updated", data: updated });
  } catch (error) {
    console.error("Admin principals PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update principal" }, { status: 500 });
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
    const deleted = await Principal.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Principal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Principal deleted" });
  } catch (error) {
    console.error("Admin principals DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete principal" }, { status: 500 });
  }
}
