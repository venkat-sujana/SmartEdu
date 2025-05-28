"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// import Lecturer from "@/models/Lecturer";

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);


  useEffect(() => {
    if (!id) return;

    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => data.status === "success" && setStudent(data.data));

    fetch(`/api/exams/student/${id}`)
      .then((res) => res.json())
      .then((data) => setExams(data));

    fetch(`/api/attendance/student/${id}`)
      .then((res) => res.json())
      .then((data) => setAttendance(data));
  }, [id]);

  const isGeneral = (group) =>
    ["MPC", "BiPC", "CEC", "HEC"].includes(group);
  const isVocational = (group) =>
    ["M&AT", "MLT", "CET"].includes(group);

  const getMaxMarks = (examType, streamType) => {
    if (!examType) return 0;
    const type = examType.toLowerCase();

    if (["unit-1", "unit-2", "unit-3", "unit-4"].includes(type)) return 25;
    if (["quarterly", "half-yearly","halfyearly"].includes(type)) return 50;
    if (["pre-public-1", "pre-public-2"].includes(type)) {
      return streamType === "general" ? 100 : 50;
    }

    return 0;
  };

  const isFail = (mark, max, stream, examType) => {
    const m = mark === "A" || mark === "AB" ? 0 : Number(mark);
    if (["A", "AB", 0].includes(mark)) return true;

    if (stream === "general") {
      if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(examType)) return m < 9;
      else if (["Quarterly", "Half-Yearly"].includes(examType)) return m < 18;
      else if (["Pre-Public-1", "Pre-Public-2"].includes(examType)) return m < 35;
    } else {
      if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(examType)) return m < 9;
      else return m < 18;
    }

    return false;
  };

  if (!student) return <div className="p-4">Loading student info...</div>;

  const stream = isGeneral(student.group) ? "general" : "vocational";
  const subjectCount = stream === "general" ? 6 : 5;

  return (
    <div className="p-6 max-w-6xl mx-auto">

    
      {/* College Header */}
<div className="text-center mb-6">
  
  <h1 className="text-xl md:text-2xl font-bold uppercase">
    S.K.R GOVERNMENT JUNIOR COLLEGE, GUDUR
  </h1>
  <p className="italic text-sm">
    THILAK NAGAR, GUDUR - 524101, TIRUPATI Dt
  </p>
  <h2 className="font-bold mt-1 uppercase">Care Taker</h2>
</div>

      <h1 className="text-2xl font-bold mb-6">Student Profile</h1>

      {/* Profile Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-8">
  {/* Left: Student Info */}
  <div className="space-y-1 text-sm">
    <p><strong>Name:</strong> {student.name}</p>
    <p><strong>Father:</strong> {student.fatherName}</p>
    <p><strong>Group:</strong> {student.group}</p>
    <p><strong>Admission No:</strong> {student.admissionNo}</p>
    <p><strong>Mobile:</strong> {student.mobile}</p>
    <p><strong>Caste:</strong> {student.caste}</p>
    <p><strong>Address:</strong> {student.address}</p>
  </div>

  {/* Center: Logo */}
  <div className="flex justify-center items-center">
    <img
      src="/images/apbise.png"
      alt="Board Logo"
      className="w-30  h-30 object-contain"
    />
  </div>

  {/* Right: Student Photo */}
  <div className="flex justify-end">
    <img
      src={student.photo || "/student-placeholder.png"}
      alt="Student"
      className="w-40 h-48 object-cover border rounded"
    />
  </div>
</div>

      {/* Exams in 3x3 grid */}
      <h2 className="text-lg font-semibold mb-3">Exam Summary</h2>
      {exams.length === 0 ? (
        <p className="text-gray-500">No exam records available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {exams.map((e, i) => {
            const subjects = e.generalSubjects || e.vocationalSubjects || {};
            const maxMark = getMaxMarks(e.examType, stream);
            const marksArray = Object.values(subjects).map((m) =>
              m === "A" || m === "AB" ? 0 : Number(m)
            );
            const total = marksArray.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
            const percentage = ((total / (subjectCount * maxMark)) * 100).toFixed(2);
            const hasFail = Object.entries(subjects).some(
              ([_, m]) => isFail(m, maxMark, stream, e.examType)
            );

            return (
              <div
                key={i}
                className="border rounded-lg p-3 shadow-sm bg-white"
              >
                <h3 className="font-bold text-sm mb-2">{e.examType}</h3>
                <p><strong>Total:</strong> {total}</p>
                <p><strong>Percentage:</strong> {percentage}%</p>
                <p className={hasFail ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                  {hasFail ? "FAIL" : "PASS"}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 text-xs">View Subject-wise</summary>
                  <table className="w-full text-xs mt-2 border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-1">Subject</th>
                        <th className="border p-1">Marks</th>
                        <th className="border p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(subjects).map(([sub, mark], idx) => {
                        const fail = isFail(mark, maxMark, stream, e.examType);
                        return (
                          <tr key={idx}>
                            <td className="border p-1 capitalize">{sub}</td>
                            <td className="border p-1">{mark}</td>
                            <td className={`border p-1 ${fail ? "text-red-500" : "text-green-600"}`}>
                              {fail ? "Fail" : "Pass"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </details>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance Summary */}
      <h2 className="text-lg font-semibold mb-2">Attendance Summary</h2>
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
                <td className="border p-1">{new Date(a.date).toLocaleDateString()}</td>
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
  );
}
