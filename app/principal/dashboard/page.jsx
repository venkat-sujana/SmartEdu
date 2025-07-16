export const dynamic = "force-dynamic"; // 👈 MOST IMPORTANT LINE

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "../logout/LogoutButton";

export default async function PrincipalDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "principal") {
    return <div>Unauthorized access</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
      <img src={session.user.photo} className="w-20 h-20 rounded-full mt-4" />
      <p>College ID: {session.user.collegeId}</p>
      <LogoutButton />
    </div>
  );
}
