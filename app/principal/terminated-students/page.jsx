// app/principal/terminated-students/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function TerminatedStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTerminated = async () => {
    try {
      const res = await fetch("/api/students/terminated");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError("Failed to load terminated students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminated();
  }, []);

  const restoreStudent = async (id) => {
    const confirmRestore = window.confirm("Restore this student?");
    if (!confirmRestore) return;

    try {
      const res = await fetch(`/api/students/restore/${id}`, {
        method: "PUT",
      });
      const data = await res.json();

      if (data.success) {
        setStudents(students.filter((s) => s._id !== id));
      }
    } catch (err) {
      alert("Restore failed");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Terminated Students</h1>

      {students.length === 0 ? (
        <p className="text-gray-600">No terminated students</p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Admission No</th>
                <th className="p-3">Year</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.admissionNo}</td>
                  <td className="p-3">{s.yearOfStudy}</td>
                  <td className="p-3">
                    <button
                      onClick={() => restoreStudent(s._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

