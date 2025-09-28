//app/student/dashboard/page.jsx

"use client";
import StudentIndividualExams from "@/app/components/StudentIndividualExams/page";
import StudentMonthlyAttendanceSummary from "@/app/components/StudentMonthlyAttendanceSummary/page";
import { useSession } from "next-auth/react";
 // ఇక్కడ మీ component ఫైల్ according path మార్చాలి


export default function StudentDashboard() {
  const { data: session, status } = useSession();

  console.log("Session", session);
  console.log("Status", status);

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

  console.log("User", user);

  return (
    <div className="max-w-5xl mx-auto font-bold  px-4 py-12 space-y-10 p-3 rounded shadow">
      {/* Header */}
      <h1 className="text-xl font-extrabold text-center text-blue-700 tracking-tight ">
        🎓 Student Dashboard
      </h1>

      <h2 className="text-xl bg-black font-bold text-center text-white mb-5 max-w-5xl mx-auto border border-blue-500 p-3 rounded shadow">
        {user.collegeName}
      </h2>

      {/* Profile Section */}
      <div className="bg-cyan-50 bg-opacity/70 backdrop-blur-md border  border-blue-400 shadow-4xl rounded-3xl p-10 transition-transform hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Profile Photo */}
          <div className="relative">
            <img
              src={user.photo || "/default-avatar.png"}
              alt={user.name}
              className="w-36 h-36 rounded-full object-cover border-2 border-blue-400 shadow-4xl "
            />
            <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
              <p>
                <span className="font-bold text-gray-800">Admission No:</span> &nbsp;
                <span className="text-gray-600 font-bold">{user.admissionNo}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">College:</span> &nbsp;
                <span className="text-gray-600 font-bold">{user.collegeName}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Year:</span> &nbsp;
                <span className="text-gray-600 font-bold">{user.yearOfStudy}</span>
                
              </p>

              <p>
                <span className="font-bold text-gray-800">Group:</span>&nbsp; 
                <span className="text-gray-600 font-bold">{user.group}</span>
              </p>

              <p className="text-gray-600 mb-1">
                <span className="font-bold">Father Name:</span> &nbsp;
                <span className="text-gray-600 font-bold">{user.fatherName}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Mobile:</span> &nbsp;
                <span className="text-gray-600 font-bold">{user.mobile}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Caste:</span> &nbsp;
                <span className="text-gray-600 font-bold">{user.caste}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">DOB:</span> &nbsp;
                <span className="text-gray-600 font-bold">{new Date(user.dob).toLocaleDateString()}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Gender:</span> &nbsp;
                <span className="text-gray-600 font-bold">{user.gender}</span>
              </p>
              <p className="md:col-span-2">
                <span className="font-bold text-gray-800">Address:</span>&nbsp; 
                <span className="text-gray-600 font-bold">{user.address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Summary Section */}
     <StudentMonthlyAttendanceSummary studentId={user.id} />
      {/* Individual Exam Results Section */}
     <StudentIndividualExams studentId={user.id} />
    </div>
  );
}
