import { NextResponse } from "next/server";
import { clearInvigilationAuthCookie } from "@/lib/invigilation-auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  clearInvigilationAuthCookie(response);
  return response;
}

