import { NextResponse } from "next/server";
import College from "@/models/College";
import connectMongoDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(req, context) {
  try {
    await connectMongoDB();

    // ✅ Next 16: params is a Promise
    const { params } = await context;
    const { id } = params;

    console.log("Received college id:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid ObjectId format:", id);
      return NextResponse.json(
        { error: "Invalid college ID format" },
        { status: 400 }
      );
    }

    const college = await College.findById(id).select("name");
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
        id: college._id,
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
