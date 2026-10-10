//src/lib/osra-api-guard.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireOsraAuth(req, allowedRoles = []) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = session.user.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  const user = {
    ...session.user,
    id: session.user.id,
    _id: session.user.id,
    role,
  };

  return { user };
}