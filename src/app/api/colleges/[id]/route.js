// app/api/colleges/[id]/route.js
import { NextResponse } from "next/server";
import College from "@/models/College";
import connectMongoDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(_req, context) {
  try {
    await connectMongoDB();

    // ✅ params promise ను direct await చేయండి (Next 15/16)
    const { id } = await context.params;

    console.log("Received college id:", id);

    // ✅ Stringify చేసి validate చేయడం safe
    const strId = String(id);
    if (!mongoose.Types.ObjectId.isValid(strId)) {
      console.error("Invalid ObjectId format:", strId);
      return NextResponse.json(
        { error: "Invalid college ID format" },
        { status: 400 }
      );
    }

    const college = await College.findById(strId).select("name");
    console.log("College found:", college);

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        name: college.name,
        id: college._id.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching college name:", {
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid college ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch college name" },
      { status: 500 }
    );
  }
}
