"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function ExamsFormPage() {
  const [students, setStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
  const vocationalStreams = ["M&AT", "CET", "MLT"];
  const generalSubjects = ["Tel/Sansk", "English", "Math/Bot/Civ", "Math/Zoo/His", "Phy/Com", "Che/Com"];
  const vocationalSubjects = ["GFC", "Eng", "V1/V4", "V2/V5", "V3/V6"];

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
    ? students.filter((s) => s.group?.toLowerCase() === formData.stream.toLowerCase())
    : [];

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name.startsWith("subject_")) {
    const subjectKey = name.replace("subject_", "");
    const subjectValue = value.toUpperCase().trim();

    setFormData((prev) => {
      const updatedSubjects = {
        ...prev.subjects,
        [subjectKey]: subjectValue === "A" || subjectValue === "AB" ? subjectValue : isNaN(Number(subjectValue)) ? "" : Number(subjectValue),
      };

      const subjectMarks = Object.values(updatedSubjects);
      const validMarks = subjectMarks.filter((v) => typeof v === "number" && !isNaN(v));
      const totalMarks = validMarks.reduce((sum, val) => sum + val, 0);
      const percent = validMarks.length > 0 ? (totalMarks / validMarks.length).toFixed(2) : 0;

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
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("✅ Exam saved successfully!");
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
        toast.error(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Server error while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectsToRender = generalStreams.includes(formData.stream)
    ? generalSubjects
    : vocationalStreams.includes(formData.stream)
    ? vocationalSubjects
    : [];

  return (
    <div className="relative min-h-screen bg-gray-100 p-4">
      <Toaster />
      {isSubmitting && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-blue-600 text-xl font-semibold animate-pulse">Saving Exam Data...</div>
        </div>
      )}

      <div className="max-w-xl mx-auto p-4 bg-white shadow rounded relative z-10">
        <Link href="/">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-bold mb-4 cursor-pointer">
            🏠 Home
          </button>
        </Link>

        <h2 className="text-xl font-bold mb-4 flex items-center justify-center">Home Exam Marks Entry Form-2025</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                {formData.stream ? "-- Select Student --" : "-- Select Stream First --"}
              </option>
              {filteredStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

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

          {/* Subjects Grid */}
          <div>
            <label className="block font-medium mb-1">Subjects & Marks</label>
            <div className="grid grid-cols-2 gap-2">
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
                  className="border p-2 rounded"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer font-bold w-full"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
