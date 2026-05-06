//src/app/api/ai-attendance/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import connectMongoDB from "@/lib/mongodb";
import { handleAiQuery } from "@/services/aiAttendanceService";
import { getLecturerGroupFromSubject } from "@/lib/lecturerGroupAccess";
export async function POST(request) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          response: "Please sign in to use the AI attendance assistant.",
        },
        { status: 401 }
      );
    }

    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        {
          error: "Query required",
          response: "Please enter a question about attendance.",
        },
        { status: 400 }
      );
    }

    const collegeId = session.user.collegeId;
    const allowedGroup =
      session.user.role === "lecturer"
        ? getLecturerGroupFromSubject(session.user.subject)
        : null;
    const response = await handleAiQuery(query.trim(), collegeId, allowedGroup);

    return NextResponse.json({ response });

  } catch (error) {
    console.error("[AI-ATTENDANCE]", error);
    return NextResponse.json(
      { error: "Internal server error", response: "Sorry, could not process your query." },
      { status: 500 }
    );
  }
}
