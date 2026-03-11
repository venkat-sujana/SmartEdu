import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import User from "@/models/User";
import { getInvigilationTokenFromRequest, verifyInvigilationToken } from "@/lib/invigilation-auth";

export async function requireInvigilationAuth(req, allowedRoles = []) {
  await connectInvigilationDB();
  const token = getInvigilationTokenFromRequest(req);
  if (!token) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const decoded = verifyInvigilationToken(token);
  if (!decoded?.userId) {
    return { error: NextResponse.json({ message: "Invalid token" }, { status: 401 }) };
  }

  const user = await User.findById(decoded.userId).lean();
  if (!user) {
    return { error: NextResponse.json({ message: "User not found" }, { status: 401 }) };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

