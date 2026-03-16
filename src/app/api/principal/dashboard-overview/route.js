import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPrincipalDashboardOverview } from "@/services/principalDashboardService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.collegeId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await getPrincipalDashboardOverview(session.user.collegeId);

    return NextResponse.json(
      {
        status: "success",
        ...data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Principal dashboard overview API error:", error);

    return NextResponse.json(
      { status: "error", message: "Failed to load principal dashboard overview" },
      { status: 500 }
    );
  }
}
