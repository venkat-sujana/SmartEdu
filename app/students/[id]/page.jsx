"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (!id) return;

    // Fetch student basic info
    fetch(`/api/students/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          setStudent(data.data);
          console.log("Student data:", data.data);
        } else {
          console.error("Unexpected response format", data);
        }
      })
      .catch((err) => console.error("Student fetch failed:", err));

    // Fetch exam data
    fetch(`/api/exams/student/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Exams:", data);
        setExams(data);
      })
      .catch((err) => console.error("Exam fetch failed:", err));

    // Fetch attendance
    fetch(`/api/attendance/student/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Attendance:", data);
        setAttendance(data);
      })
      .catch((err) => console.error("Attendance fetch failed:", err));
  }, [id]);

  if (!student) return <div className="p-4">Loading student info...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Student Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="flex gap-4 items-start">
          <img
            src={student.photo || "/student-placeholder.png"}
            alt="Student"
            className="w-32 h-36 object-cover border 2px to-black rounded "
          />
          <div>
            <p><strong>Father Name:</strong> {student.fatherName}</p>
            <p><strong>Group:</strong> {student.group}</p>
            <p><strong>Admission No:</strong> {student.admissionNo}</p>
            <p><strong>Mobile:</strong> {student.mobile}</p>
            <p><strong>Caste:</strong> {student.caste}</p>
            <p><strong>Address:</strong> {student.address}</p>
          </div>
        </div>

        {/* Exam Section */}
        <div>
          <h2 className="text-lg font-bold mt-4 mb-2">Exam Marks</h2>
          {exams.length === 0 ? (
            <p className="text-gray-500">No exam records available.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-1">Exam</th>
                  <th className="border p-1">Total</th>
                  <th className="border p-1">%</th>
                  <th className="border p-1">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e, i) => (
                  <React.Fragment key={i}>
                    <tr>
                      <td className="border p-1">{e.examType}</td>
                      <td className="border p-1">{e.total}</td>
                      <td className="border p-1">{e.percentage}%</td>
                      <td className="border p-1">{e.remarks || "-"}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-2">
                        <h3 className="font-semibold mb-1">Subject-wise Marks:</h3>
                        {(e.generalSubjects || e.vocationalSubjects) ? (
                          <table className="text-sm w-full border mt-1 mb-2">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="border p-1">Subject</th>
                                <th className="border p-1">Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(e.generalSubjects || e.vocationalSubjects).map(
                                ([sub, mark], idx) => (
                                  <tr key={idx}>
                                    <td className="border p-1 capitalize">{sub}</td>
                                    <td className="border p-1">{mark}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-gray-400 text-sm">No subject marks available</p>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Attendance Section */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Attendance Summary</h2>
        {attendance.length === 0 ? (
          <p className="text-gray-500">No attendance data available.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-1">Date</th>
                <th className="border p-1">Status</th>
                <th className="border p-1">Group</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, i) => (
                <tr key={i}>
                  <td className="border p-1">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className={`border p-1 ${a.status === "Present" ? "text-green-600" : "text-red-500"}`}>
                    {a.status}
                  </td>
                  <td className="border p-1">{a.group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
