// app/lecturer/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // ✅ named export

export default function LecturerDashboard() {
  const [lecturer, setLecturer] = useState(null);
  const [students, setStudents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure window is available

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded:", decoded);
      setLecturer(decoded);

      fetch(`/api/lecturers/${decoded.id}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setStudents(data.students || []))
        .catch((err) => console.error("Failed to load students:", err));
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, []);

  if (!lecturer) return <div className="p-4">Loading dashboard...</div>;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center justify-center">
        Welcome, {lecturer.name} - {lecturer.email} ({lecturer.role})
       </h1>

      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 flex items-center justify-center">
          Assigned Students
        </h2>

        {students.length === 0 ? (
          <p className="text-gray-500 flex items-center justify-center">
            No students assigned yet.
          </p>
        ) : (
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-center">S. No</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Father Name</th>
                <th className="p-2 border">DOB</th>
                <th className="p-2 border">Admission No</th>
                <th className="p-2 border">Group</th>
                <th className="p-2 border">Mobile</th>
                <th className="p-2 border">Caste</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, index) => (
                <tr key={s._id} className="border-b">
                  <td className="p-2 border text-center">{index + 1}</td>{" "}
                
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">{s.fatherName}</td>
                  <td className="p-2 border">
                    {new Date(s.dob).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">{s.admissionNo}</td>
                  <td className="p-2 border">{s.group}</td>
                  <td className="p-2 border">{s.mobile}</td>
                  <td className="p-2 border">{s.caste}</td>
                  <td className="p-2 border">{s.address}</td>
                  <td className="p-2 border">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      onClick={() => router.push(`/students/${s._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
