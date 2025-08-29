"use client";

// import AttendanceSummaryTable from "@/app/components/AttendanceSummaryTable/page";
import StudentAttendanceSummary from "@/app/dashboard-attendance-summary/page";
import { useSession } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg font-semibold">
          🚫 Please log in to continue
        </p>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-10 tracking-tight">
        🎓 Student Dashboard
      </h1>

      <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-10 tracking-tight">
        {user.collegeName}
      </h1>

      {/* Profile Section */}
      <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-10 transition-transform hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Profile Photo */}
          <div className="relative">
            <img
              src={user.photo || "/default-avatar.png"}
              alt={user.name}
              className="w-36 h-36 rounded-full object-cover border-4 border-blue-400 shadow-lg"
            />
            <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
              <p>
                <span className="font-semibold text-gray-800">
                  Admission No:
                </span>{" "}
                {user.admissionNo}
              </p>
              <p>
                <span className="font-semibold text-gray-800">College:</span>{" "}
                {user.collegeName}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Year:</span>{" "}
                {user.yearOfStudy}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Father Name:</span>{" "}
                {user.fatherName}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Mobile:</span>{" "}
                {user.mobile}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Caste:</span>{" "}
                {user.caste}
              </p>
              <p>
                <span className="font-semibold text-gray-800">DOB:</span>{" "}
                {new Date(user.dob).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Gender:</span>{" "}
                {user.gender}
              </p>
              <p className="md:col-span-2">
                <span className="font-semibold text-gray-800">Address:</span>{" "}
                {user.address}
              </p>
            </div>
          </div>
        </div>
      </div>

<div className="mt-8">
  <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Attendance Summary</h2>
 <StudentAttendanceSummary />
 {/* <AttendanceSummaryTable /> */}
</div>

    </div>
  );
}
