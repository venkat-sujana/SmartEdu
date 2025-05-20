"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
export default function ExamsFormPage() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    stream: "",
    academicYear: "",
    examType: "",
    examDate: "",
    subjects: {}, // dynamic subjects
    total: 0,
    percentage: 0,
  });
  const [message, setMessage] = useState("");

  // Fetch student list
  useEffect(() => {
    console.log("Form Data Changed:", formData);
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setStudents(json.data);
        } else {
          console.error("Invalid student format", json);
          setStudents([]);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Subjects logic
    if (name.startsWith("subject_")) {
      const subjectKey = name.replace("subject_", "");
      const subjectValue = Number(value);

      setFormData((prev) => {
        const updatedSubjects = {
          ...prev.subjects,
          [subjectKey]: subjectValue,
        };
        const subjectMarks = Object.values(updatedSubjects);
        const totalMarks = subjectMarks.reduce(
          (sum, val) => sum + (Number(val) || 0),
          0
        );
        const percent =
          subjectMarks.length > 0 ? totalMarks / subjectMarks.length : 0;

        return {
          ...prev,
          subjects: updatedSubjects,
          total: totalMarks,
          percentage: percent.toFixed(2),
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Exam saved successfully!");
        setFormData({
          studentId: "",
          stream: "",
          academicYear: "",
          examType: "",
          examDate: "",
          subjects: {},
          total: 0,
          percentage: 0,
        });
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error while submitting.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <Link href="/">
        <button className="w-50 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold mr-2">
          🏠&nbsp;Home
        </button>
      </Link>

      {/* <Link href="/student-table">
        <button className="w-50 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold mr-2">
          📝&nbsp; Student-Table
        </button>
      </Link>

      <Link href="/exam-report">
        <button className="w-50 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
          📝&nbsp; Exam Report
        </button>
      </Link> */}
      <h2 className="text-xl font-bold mb-4">Home Exam Marks Entry Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student */}
        <div>
          <label className="block font-medium">Student</label>
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stream */}
        <div>
          <label className="block font-medium">Stream</label>
          <select
            name="stream"
            value={formData.stream}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Stream --</option>
            {["MPC", "BIPC", "CEC", "HEC", "M&AT", "CET", "MLT"].map(
              (stream) => (
                <option key={stream} value={stream}>
                  {stream}
                </option>
              )
            )}
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block font-medium">Academic Year</label>
          <select
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Year --</option>
            <option value="2025-1">First Year</option>
            <option value="2025-2">Second Year</option>
          </select>
        </div>

        {/* Exam Type */}
        <div>
          <label className="block font-medium">Exam Type</label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Exam Type --</option>
            {[
              "UNIT-1",
              "UNIT-2",
              "UNIT-3",
              "UNIT-4",
              "QUARTERLY",
              "HALFYEARLY",
              "PRE-PUBLIC-1",
              "PRE-PUBLIC-2",
            ].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Date */}
        <div>
          <label className="block font-medium">Exam Date</label>
          <input
            type="date"
            name="examDate"
            value={formData.examDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Subjects */}
        <div>
          <label className="block font-medium mb-1">Subjects & Marks</label>
          {[
            "subject1",
            "subject2",
            "subject3",
            "subject4",
            "subject5",
            "subject6",
          ].map((subject) => (
            <input
              key={subject}
              type="number"
              name={`subject_${subject}`}
              placeholder={`Enter ${subject} marks`}
              value={formData.subjects[subject] || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-2"
            />
          ))}
        </div>

        {/* Total and Percentage */}
        {/* <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Total</label>
            <input type="text" value={formData.total} readOnly className="w-full border p-2 bg-gray-100 rounded" />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Percentage</label>
            <input type="text" value={formData.percentage} readOnly className="w-full border p-2 bg-gray-100 rounded" />
          </div>
        </div> */}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer font-bold"
        >
          Save Exam
        </button>
      </form>

      {message && <p className="mt-4 font-semibold">{message}</p>}
    </div>
  );
}
