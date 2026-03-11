import { NextResponse } from "next/server";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";
import LecturerProfile from "@/models/LecturerProfile";

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req);
  if (error) return error;

  let profile = null;
  if (user.role === "lecturer") {
    profile = await LecturerProfile.findOne({ userId: user._id }).lean();
  }

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: profile?.designation || profile?.department || "",
      institutionName: profile?.institutionName || "",
      phone: profile?.phone || "",
    },
  });
}
