// app/lecturer/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // ✅ named export
import Link from "next/link";

export default function LecturerDashboard() {
  const [lecturer, setLecturer] = useState(null);
  const [students, setStudents] = useState([]);
  const router = useRouter();

useEffect(() => {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  try {
    const decoded = jwtDecode(token);
    fetch(`/api/lecturers/${decoded.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLecturer(data.lecturer); // ✅ photo వస్తుంది
      });

    fetch(`/api/lecturers/${decoded.id}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []));
  } catch (error) {
    localStorage.removeItem("token");
    router.push("/login");
  }
}, []);


  const isGeneral = (group) => ["MPC", "BiPC", "CEC", "HEC"].includes(group);
  const isVocational = (group) => ["M&AT", "MLT", "CET"].includes(group);

  // 🔐 Handle logout functionality

  const handleLogout = () => {
    // 🔐 Remove token from localStorage
    localStorage.removeItem("token");

    // 🔄 Redirect to login page
    router.push("/login");
  };

  if (!lecturer) return <div className="p-4">Loading dashboard...</div>;

  return (
    // Main Dashboard Layout
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-100 to-slate-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-amber-900 mb-6 drop-shadow-md">
        🧑‍🏫 Lecturer Dashboard
      </h1>

      {/* Top Action Buttons */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg mb-6 print:hidden">
        <Link href="/">
          <button className="bg-amber-800 text-white px-5 py-2 rounded-xl hover:bg-amber-700 transition-all shadow-sm font-semibold flex items-center gap-1">
            🏠 Home
          </button>
        </Link>

        <Link href="/lecturer/assign">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            ✏️ Add Students
          </button>
        </Link>

        <Link href="/lecturer/profile/edit">
          <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            ✏️ Edit Profile
          </button>
        </Link>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition-all shadow-sm font-semibold flex items-center gap-1"
          >
            🖨️ Print
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition-all shadow-sm font-semibold flex items-center gap-1"
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {/* Lecturer Info with Photo */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {lecturer?.photo ? (
          <img
            src={lecturer.photo}
            alt="Lecturer Photo"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl shadow">
            ?
          </div>
        )}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, <span className="text-blue-700">{lecturer.name}</span>
          </h2>
          <p className="text-lg text-gray-600 mt-1">
            Junior Lecturer in{" "}
            <span className="font-semibold text-blue-700">
              {lecturer.subject}
            </span>
          </p>
        </div>
        
      </div>

      {/* Assigned Students */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          🎓 Assigned Students
        </h2>

        {students.length === 0 ? (
          <p className="text-gray-500 text-center">No students assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-3 border text-center">S. No</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Father Name</th>
                  <th className="p-3 border">DOB</th>
                  <th className="p-3 border">Admission No</th>
                  <th className="p-3 border">Stream</th>
                  <th className="p-3 border">Group</th>
                  <th className="p-3 border">Year</th>
                  <th className="p-3 border">Mobile</th>
                  <th className="p-3 border">Caste</th>
                  <th className="p-3 border">Address</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, index) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border">{s.name}</td>
                    <td className="p-2 border">{s.fatherName}</td>
                    <td className="p-2 border">
                      {new Date(s.dob).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">{s.admissionNo}</td>
                    <td className="p-2 border">
                      {["MPC", "BiPC", "CEC", "HEC"].includes(s.group)
                        ? "General"
                        : "Vocational"}
                    </td>
                    <td className="p-2 border">{s.group}</td>
                    <td className="p-2 border">{s.yearOfStudy}</td>
                    <td className="p-2 border">{s.mobile}</td>
                    <td className="p-2 border">{s.caste}</td>
                    <td className="p-2 border">{s.address}</td>
                    <td className="p-2 border">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition"
                        onClick={() => router.push(`/students/${s._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
