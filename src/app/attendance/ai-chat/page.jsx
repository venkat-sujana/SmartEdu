"use client"

import AiChat from "@/components/attendance/AiChat";
import { requireRole } from "@/lib/requireRole";

export default function AiAttendanceChatPage() {
  return (
    <main className="min-h-screen">
      <AiChat />
    </main>
  );
}


