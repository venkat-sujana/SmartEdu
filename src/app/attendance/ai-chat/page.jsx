"use client"

import { useEffect } from "react";
import AiChat from "@/components/attendance/AiChat";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AiAttendanceChatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const canAccessAiAttendance = role === "lecturer" || role === "principal";

  useEffect(() => {
    if (status !== "loading" && session && !canAccessAiAttendance) {
      router.replace("/");
    }
  }, [canAccessAiAttendance, router, session, status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Checking access...</p>
      </main>
    );
  }

  if (!canAccessAiAttendance) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <AiChat />
    </main>
  );
}


