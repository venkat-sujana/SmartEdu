import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}
