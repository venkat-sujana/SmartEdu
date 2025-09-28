// app/components/StudentIndividualExams/page.jsx

"use client";
import React, { useEffect, useState } from "react";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

export default function StudentIndividualExams({ studentId }) {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;

    async function fetchExamResults() {
      try {
        setLoading(true);
        const res = await fetch(`/api/exams/student/${studentId}`);
        const json = await res.json();

        if (res.ok) {
          const updatedExams = (json || []).map((exam) => {
            const stream = exam.stream;
            const subjects =
              ["MPC", "BIPC", "CEC", "HEC"].includes(stream)
                ? exam.generalSubjects || {}
                : exam.vocationalSubjects || {};

            const subjectCount = Object.keys(subjects).length;

            let maxMarksPerSub = 0;

            if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(exam.examType)) {
              maxMarksPerSub = 25;
            } else if (["QUARTERLY", "HALF-YEARLY"].includes(exam.examType)) {
              maxMarksPerSub = 50;
            } else if (["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(exam.examType)) {
              maxMarksPerSub = ["MPC", "BIPC", "CEC", "HEC"].includes(stream)
                ? 100 // General
                : 50; // Vocational
            }

            const baseTotal = subjectCount * maxMarksPerSub;

            let obtained = 0;
            let result = "Pass";

            Object.entries(subjects).forEach(([_, score]) => {
              let marks = score === "A" ? 0 : parseInt(score) || 0;
              obtained += marks;

              // Fail conditions
              if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(exam.examType)) {
                if (score === "A" || marks < 9) result = "Fail";
              } else if (["QUARTERLY", "HALF-YEARLY"].includes(exam.examType)) {
                if (score === "A" || marks < 18) result = "Fail";
              } else if (["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(exam.examType)) {
                if (["MPC", "BIPC", "CEC", "HEC"].includes(stream)) {
                  if (score === "A" || marks < 35) result = "Fail";
                } else {
                  if (score === "A" || marks < 18) result = "Fail";
                }
              }
            });

            // ✅ Final percentage calculation (no duplicate const)
            const percentage = baseTotal > 0 ? (obtained / baseTotal) * 100 : 0;

            return {
              ...exam,
              total: obtained,
              percentage,
              result,
            };
          });

          setExamResults(updatedExams);
          setError("");
        } else {
          setError(json.error || "Failed to fetch exam results");
          setExamResults([]);
        }
      } catch (err) {
        console.error("Server error while fetching exam results:", err);
        setError("Server error while fetching exam results");
        setExamResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchExamResults();
  }, [studentId]);

  if (loading) return <p>Loading exam results...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (examResults.length === 0) return <p>No exam results available.</p>;

  return (
    <div className="max-w-5xl bg-emerald-50 border border-blue-500 mx-auto p-4  rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Exam Results</h2>

      {examResults.map((exam) => (
        <div
          key={exam._id}
          className="mb-8 border border-gray-300 rounded p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-1">{exam.examType}</h3>
          <p className="text-gray-700 mb-3">
            Date: {formatDate(exam.examDate)} | Stream: {exam.stream} | Year:{" "}
            {exam.yearOfStudy} | Academic Year: {exam.academicYear}
          </p>

          <table className="w-full border-collapse border border-gray-300 text-center text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="border border-green-700 p-2">Subject</th>
                <th className="border border-green-700 p-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {exam.generalSubjects &&
                Object.entries(exam.generalSubjects).map(([subject, score]) => (
                  <tr key={subject} className="even:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-semibold">
                      {subject}
                    </td>
                    <td className="border border-gray-300 p-2">{score}</td>
                  </tr>
                ))}
              {exam.vocationalSubjects &&
                Object.entries(exam.vocationalSubjects).map(([subject, score]) => (
                  <tr key={subject} className="even:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-semibold">
                      {subject}
                    </td>
                    <td className="border border-gray-300 p-2">{score}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="mt-4 font-semibold text-gray-800">
            <p>Total Marks: {exam.total} / {exam.stream && (["MPC", "BIPC", "CEC", "HEC"].includes(exam.stream) ? 6 : 5) *
              (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(exam.examType)
                ? 25
                : ["QUARTERLY", "HALF-YEARLY"].includes(exam.examType)
                ? 50
                : ["MPC", "BIPC", "CEC", "HEC"].includes(exam.stream)
                ? 100
                : 50)}</p>
            <p>Percentage: {exam.percentage.toFixed(2)}%</p>
            <p>
              Result:{" "}
              <span
                className={
                  exam.result === "Pass"
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {exam.result}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
