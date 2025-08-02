// app/lecturer/dashboard/page.jsx
'use client';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LecturerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/lecturer/login");
    }

    if (status === "authenticated" && session?.user?.collegeId) {
      fetch(`/api/colleges/${session.user.collegeId}`)
        .then(res => res.json())
        .then(data => {
          if (data?.name) setCollegeName(data.name);
        });
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  const { user } = session || {};

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">🎓 Lecturer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
          <p><span className="font-semibold">👤 Name:</span> {user?.name}</p>
          <p><span className="font-semibold">📧 Email:</span> {user?.email}</p>
          <p><span className="font-semibold">📚 Subject:</span> {user?.subject}</p>
          <p><span className="font-semibold">🏫 College:</span> {collegeName || "Loading..."}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/student-table">
            <div className="cursor-pointer p-4 bg-blue-100 hover:bg-blue-200 rounded-lg shadow-md text-center">
              <p className="font-semibold text-blue-800">📋 Students</p>
            </div>
          </Link>

          <Link href="/exam-report">
            <div className="cursor-pointer p-4 bg-green-100 hover:bg-green-200 rounded-lg shadow-md text-center">
              <p className="font-semibold text-green-800">📝 Exams</p>
            </div>
          </Link>

          <Link href="/attendance-records">
            <div className="cursor-pointer p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg shadow-md text-center">
              <p className="font-semibold text-yellow-800">📆 Attendance</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
