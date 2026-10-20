
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectMongoDB from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCaretakerLecturerGroupAccess } from "@/lib/caretakerGroupAccess";

export async function GET() {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "lecturer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const access = await getCaretakerLecturerGroupAccess(session);

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: "No authorized group mapping found",
          groups: [],
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      groups: access.groups,
    });
  } catch (error) {
    console.error("Lecturer group mapping API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load group mapping" },
      { status: 500 }
    );
  }
}
