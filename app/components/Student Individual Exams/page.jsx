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
          setExamResults(json || []);
          setError("");
        } else {
          setError(json.error || "Failed to fetch exam results");
          setExamResults([]);
        }
      } catch (err) {
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
    <div className="max-w-5xl mx-auto p-4 bg-white rounded shadow">
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
                <th className="border border-green-700 p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(exam.vocationalSubjects).map(([subject, score]) => (
                <tr key={subject} className="even:bg-gray-50">
                  <td className="border border-gray-300 p-2 font-semibold">{subject}</td>
                  <td className="border border-gray-300 p-2">{score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 font-semibold text-gray-800">
            <p>Total Marks: {exam.total}</p>
            <p>Percentage: {exam.percentage.toFixed(2)}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}
