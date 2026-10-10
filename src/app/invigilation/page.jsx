//src/app/invigilation/page.jsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function InvigilationHome() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (role === "admin") {
    redirect("/invigilation/admin/dashboard");
  }

  if (role === "lecturer") {
    redirect("/invigilation/lecturer/dashboard");
  }

  redirect("/auth/login");
}