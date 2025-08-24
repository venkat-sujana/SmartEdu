//app/student/dashboard/page.jsx
"use client";

import { useSession, signOut } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">You are not logged in.</p>
      </div>
    );
  }

  const student = session.user;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Welcome, {student.name}
        </h1>

      </header>

      <section className="bg-white p-6 rounded-2xl shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Profile Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Admission No:</p>
            <p>{student.admissionNo}</p>
          </div>
          <div>
            <p className="font-medium">Year of Study:</p>
            <p>{student.yearOfStudy}</p>
          </div>
          <div>
            <p className="font-medium">College ID:</p>
            <p>{student.collegeId}</p>
          </div>
          {student.photo && (
            <div>
              <p className="font-medium">Photo:</p>
              <img
                src={student.photo}
                alt="Profile Photo"
                className="w-32 h-32 rounded-full mt-2"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
