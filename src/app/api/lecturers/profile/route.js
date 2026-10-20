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
      .select("name email subject collegeName collegeId")
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
      },
    });
  } catch (error) {
    console.error("Lecturer profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch lecturer profile" }, { status: 500 });
  }
}

export async function PUT(req) {
  return NextResponse.json({ error: "Photo updates are no longer supported" }, { status: 400 });
}
