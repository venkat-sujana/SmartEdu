import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import connectMongoDB from "@/lib/mongodb";
import { handleAiQuery } from "@/services/attendanceService";
import { requireRole } from "@/lib/requireRole";

export async function POST(request) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const collegeId = session.user.collegeId;
    const response = await handleAiQuery(query.toLowerCase(), collegeId);

    return NextResponse.json({ response });

  } catch (error) {
    console.error("[AI-ATTENDANCE]", error);
    return NextResponse.json(
      { error: "Internal server error", response: "Sorry, could not process your query." },
      { status: 500 }
    );
  }
}
