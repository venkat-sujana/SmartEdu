// app/api/colleges/[id]/route.js

import { NextResponse } from "next/server";
import College from "@/models/College";
import connectMongoDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(_req, context) {
  try {
    await connectMongoDB();

    const { id } = await context.params;
    const strId = String(id);

    if (!mongoose.Types.ObjectId.isValid(strId)) {
      return NextResponse.json(
        { error: "Invalid college ID format" },
        { status: 400 }
      );
    }

    const college = await College.findById(strId).select(
      "name address district contactEmail contactPhone groups"
    );

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: college._id.toString(),
        name: college.name || "",
        address: college.address || "",
        district: college.district || "",
        email: college.contactEmail || "",
        phone: college.contactPhone || "",
        groups: college.groups || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching college details:", error);

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid college ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch college details" },
      { status: 500 }
    );
  }
}
