import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
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
      fatherName: body.fatherName?.trim(),
      mobile: body.mobile?.trim(),
      parentMobile: body.parentMobile?.trim(),
      group: body.group,
      caste: body.caste,
      gender: body.gender,
      yearOfStudy: body.yearOfStudy,
      admissionYear: body.admissionYear ? Number(body.admissionYear) : undefined,
      address: body.address?.trim(),
      admissionNo: body.admissionNo?.trim().toUpperCase(),
      collegeId: body.collegeId,
      status: body.status,
      dob: body.dob || null,
      dateOfJoining: body.dateOfJoining || null,
      photo: body.photo || "",
      subjects: Array.isArray(body.subjects) ? body.subjects : undefined,
    };

    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    if (body.password?.trim()) {
      update.password = await bcrypt.hash(body.password.trim(), 10);
    }

    const updated = await Student.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("collegeId", "name");

    if (!updated) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student updated", data: updated });
  } catch (error) {
    console.error("Admin students PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update student" }, { status: 500 });
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
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted" });
  } catch (error) {
    console.error("Admin students DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
