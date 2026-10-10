//src/app/api/auth/me
import { NextResponse } from "next/server";
import { requireOsraAuth } from "@/lib/osra-api-guard";
import LecturerProfile from "@/models/LecturerProfile";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";

export async function GET(req) {
  const { user, error } = await requireOsraAuth(req);
  if (error) return error;

  let profile = null;
  if (user.role === "lecturer") {
    await connectInvigilationDB();
    profile = await LecturerProfile.findOne({ userId: user._id }).lean();
  }

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId || null,
      collegeName: user.collegeName || null,
      designation: profile?.designation || profile?.department || "",
      institutionName: profile?.institutionName || "",
      phone: profile?.phone || "",
    },
  });
}