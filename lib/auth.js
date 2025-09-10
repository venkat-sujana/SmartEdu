import { getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  return await getServerSession(nextAuthOptions);
}

// ✅ re-export చేస్తూ
export const authOptions = nextAuthOptions;

