//src/app/api/office-staff/[id]/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import OfficeStaff from "@/models/OfficeStaff";
import College from "@/models/College";
import { getAdminSession } from "@/lib/requireAdminSession";

export async function PUT(req, context) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const { id } = await context.params;
    const body = await req.json();

    const update = {
      employeeId: body.employeeId?.trim(),
      name: body.name?.trim(),
      email: body.email?.trim().toLowerCase(),
      designation: body.designation,
      mobile: body.mobile || "",
      photo: body.photo || "",
      status: body.status || "Active",
    };

    if (body.collegeId) {
      const college = await College.findById(body.collegeId).lean();

      if (!college) {
        return NextResponse.json(
          { error: "Invalid college" },
          { status: 400 }
        );
      }

      update.collegeId = body.collegeId;
    }

    if (body.password?.trim()) {
      update.password = await bcrypt.hash(body.password.trim(), 10);
    }

    Object.keys(update).forEach((key) => {
      if (update[key] === undefined) delete update[key];
    });

    const updated = await OfficeStaff.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
        runValidators: true,
      }
    ).populate("collegeId", "name");

    if (!updated) {
      return NextResponse.json(
        { error: "Office Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Office Staff updated successfully",
      data: updated,
    });

  } catch (error) {

    console.error("Office Staff PUT Error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req, context) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const { id } = await context.params;

    const deleted = await OfficeStaff.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Office Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Office Staff deleted successfully",
    });

  } catch (error) {

    console.error("Office Staff DELETE Error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}