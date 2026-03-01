import { getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  return getServerSession(nextAuthOptions);
}

export const authOptions = nextAuthOptions;
