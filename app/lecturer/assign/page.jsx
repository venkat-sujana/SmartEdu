"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignStudentsPage() {
  const router = useRouter();
  const [lecturers, setLecturers] = useState([]);
  const [lecturerId, setLecturerId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching lecturers and students...");
        
        const [lecturersRes, studentsRes] = await Promise.all([
          fetch("/api/lecturers"),
          fetch("/api/students")
        ]);

        const lecturersData = await lecturersRes.json();
        const studentsData = await studentsRes.json();

        setLecturers(Array.isArray(lecturersData) ? lecturersData : lecturersData?.data || []);
        setStudents(Array.isArray(studentsData) ? studentsData : studentsData?.data || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      if (!lecturerId || selectedStudents.length === 0) {
        throw new Error("Please select both a lecturer and at least one student");
      }

      const res = await fetch("/api/lecturers/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lecturerId, 
          studentIds: selectedStudents 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Assignment failed");
      }

      setMessage("Students assigned successfully!");
      console.log("Assignment successful:", data);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/lecturer/dashboard");
      }, 2000);

    } catch (error) {
      console.error("Assignment error:", error);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Assign Students to Lecturer</h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes("success") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Lecturer</label>
          <select
            value={lecturerId}
            onChange={(e) => setLecturerId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            disabled={isSubmitting}
          >
            <option value="">-- Select Lecturer --</option>
            {lecturers.map((lec) => (
              <option key={lec._id} value={lec._id}>
                {lec.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Select Students</label>
          <div className="h-48 overflow-y-auto border rounded p-2">
            {students.length > 0 ? (
              students.map((stu) => (
                <div key={stu._id} className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    id={`student-${stu._id}`}
                    value={stu._id}
                    checked={selectedStudents.includes(stu._id)}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedStudents((prev) =>
                        prev.includes(id)
                          ? prev.filter((s) => s !== id)
                          : [...prev, id]
                      );
                    }}
                    disabled={isSubmitting}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`student-${stu._id}`} className="select-none">
                    {stu.name} ({stu.rollNumber || stu.email})
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No students available</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !lecturerId || selectedStudents.length === 0}
          className={`px-4 py-2 rounded text-white ${
            isSubmitting
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Assigning..." : "Assign Students"}
        </button>
      </form>
    </div>
  );
}