//app/attendance/page.js
"use client";
import { useEffect, useState } from "react";

export default function AttendanceForm() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/students");
        const json = await res.json();

        if (json?.data && Array.isArray(json.data)) {
          setStudents(json.data);
          const initialAttendance = {};
          json.data.forEach((student) => {
            initialAttendance[student._id] = "Absent";
          });
          setAttendance(initialAttendance);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault(); // Add this to stop default reload

  try {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: new Date(),
        records: attendance,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Attendance saved successfully!");
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Submit Error:", error);
    alert("Unexpected error occurred!");
  }
};



  const toggleAttendance = (id) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));
  };

  if (loading) return <p className="p-4">Loading students...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Attendance Form</h2>

      <div className="space-y-3">
        {students.map((student) => (
          <div
            key={student._id}
            className="flex items-center justify-between border p-3 rounded-md shadow-sm bg-white"
          >
            <span>{student.name}</span>
            <button
              onClick={() => toggleAttendance(student._id)}
              className={`px-4 py-1 rounded-md font-medium ${
                attendance[student._id] === "Present"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {attendance[student._id]}
            </button>
          </div>
          
        ))}
        <button
  onClick={handleSubmit}
  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
>
  Submit Attendance
</button>

      </div>
    </div>
  );
}
