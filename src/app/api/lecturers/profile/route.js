import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const lecturer = await Lecturer.findById(session.user.id)
      .select("name email subject collegeName collegeId photo")
      .populate("collegeId", "name")
      .lean();

    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: String(lecturer._id),
        name: lecturer.name,
        email: lecturer.email,
        subject: lecturer.subject,
        collegeId: lecturer.collegeId?._id ? String(lecturer.collegeId._id) : String(lecturer.collegeId || ""),
        collegeName: lecturer.collegeName || lecturer.collegeId?.name || "",
        photo: lecturer.photo || "",
      },
    });
  } catch (error) {
    console.error("Lecturer profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch lecturer profile" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const photo = String(body?.photo || "").trim();
    if (!photo) {
      return NextResponse.json({ error: "Photo URL is required" }, { status: 400 });
    }

    await connectMongoDB();
    const lecturer = await Lecturer.findByIdAndUpdate(
      session.user.id,
      { photo },
      { new: true, runValidators: true }
    )
      .select("name email subject collegeName collegeId photo")
      .populate("collegeId", "name")
      .lean();

    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Lecturer photo updated",
      data: {
        id: String(lecturer._id),
        name: lecturer.name,
        email: lecturer.email,
        subject: lecturer.subject,
        collegeId: lecturer.collegeId?._id ? String(lecturer.collegeId._id) : String(lecturer.collegeId || ""),
        collegeName: lecturer.collegeName || lecturer.collegeId?.name || "",
        photo: lecturer.photo || "",
      },
    });
  } catch (error) {
    console.error("Lecturer profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update lecturer photo" }, { status: 500 });
  }
}
