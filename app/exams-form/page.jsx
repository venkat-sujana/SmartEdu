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
    subjects: {},
    total: 0,
    percentage: 0,
  });
  const [message, setMessage] = useState("");

  const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
  const vocationalStreams = ["M&AT", "CET", "MLT"];

  const generalSubjects = ["subject1", "subject2", "subject3", "subject4", "subject5", "subject6"];
  const vocationalSubjects = ["subject1", "subject2", "subject3", "subject4", "subject5"];

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        const json = await res.json();
        setStudents(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = formData.stream
    ? students.filter(
        (s) => s.group?.toLowerCase() === formData.stream.toLowerCase()
      )
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("subject_")) {
      const subjectKey = name.replace("subject_", "");
      const subjectValue = value.toUpperCase();

      setFormData((prev) => {
        const updatedSubjects = {
          ...prev.subjects,
          [subjectKey]:
            subjectValue === "A" || subjectValue === "AB"
              ? subjectValue
              : Number(subjectValue),
        };

        const subjectMarks = Object.values(updatedSubjects);
        const validMarks = subjectMarks.filter((v) => typeof v === "number");
        const totalMarks = validMarks.reduce((sum, val) => sum + val, 0);
        const percent =
          validMarks.length > 0
            ? (totalMarks / validMarks.length).toFixed(2)
            : 0;

        return {
          ...prev,
          subjects: updatedSubjects,
          total: totalMarks,
          percentage: percent,
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

  // Choose subjects based on stream
  const subjectsToRender = generalStreams.includes(formData.stream)
    ? generalSubjects
    : vocationalStreams.includes(formData.stream)
    ? vocationalSubjects
    : [];

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <Link href="/">
        <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-bold mb-4">
          🏠 Home
        </button>
      </Link>

      <h2 className="text-xl font-bold mb-4">Home Exam Marks Entry Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            {[...generalStreams, ...vocationalStreams].map((stream) => (
              <option key={stream} value={stream}>
                {stream}
              </option>
            ))}
          </select>
        </div>

        {/* Student */}
        <div>
          <label className="block font-medium">Student</label>
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            disabled={!formData.stream}
          >
            <option value="">
              {formData.stream
                ? "-- Select Student --"
                : "-- Select Stream First --"}
            </option>
            {filteredStudents.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
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

        {/* Subjects based on Stream */}
        <div>
          <label className="block font-medium mb-1">Subjects & Marks</label>
          {subjectsToRender.map((subject) => (
            <input
              key={subject}
              type="text"
              name={`subject_${subject}`}
              placeholder={`Enter ${subject} marks`}
              value={
                formData.subjects[subject] === 0 ||
                formData.subjects[subject] === "0"
                  ? "0"
                  : formData.subjects[subject] || ""
              }
              onChange={handleChange}
              className="w-full border p-2 rounded mb-2"
            />
          ))}
        </div>

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
