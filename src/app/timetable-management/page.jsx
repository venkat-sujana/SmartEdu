//src/app/timetable-management/page.jsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function TimeTableManagementRoot() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (role === "admin") {
    redirect("/timetable-management/admin/dashboard");
  }

  if (role === "lecturer") {
    redirect("/timetable-management/lecturer/dashboard");
  }

  redirect("/auth/login");
}