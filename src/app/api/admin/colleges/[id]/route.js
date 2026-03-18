import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import College from "@/models/College";
import { getAdminSession } from "@/lib/requireAdminSession";
import { ensureCollegeGroups } from "@/utils/collegeGroups";

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
      code: body.code?.trim(),
      address: body.address?.trim(),
      district: body.district?.trim(),
      contactEmail: body.contactEmail?.trim(),
      contactPhone: body.contactPhone?.trim(),
      groups: body.groups ? ensureCollegeGroups(body.groups) : undefined,
    };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const updated = await College.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "College updated", data: updated });
  } catch (error) {
    console.error("Admin colleges PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update college" }, { status: 500 });
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
    const deleted = await College.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "College deleted" });
  } catch (error) {
    console.error("Admin colleges DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete college" }, { status: 500 });
  }
}
