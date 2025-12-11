"use client";

import React, { useEffect, useState } from "react";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

export default function StudentIndividualExams({ studentId }) {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) {
      setExamResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchExamResults = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/exams/student/${studentId}`, {
          cache: "no-store",
        });

        let json = null;
        try {
          json = await res.json();
        } catch (e) {
          console.error("Failed to parse exam JSON:", e);
        }

        if (!res.ok) {
          if (!cancelled) {
            setError(json?.error || "Failed to fetch exam results");
            setExamResults([]);
          }
          return;
        }

        const updatedExams = (json || []).map((exam) => {
          const stream = exam.stream;
          const isGeneralStream = ["MPC", "BIPC", "CEC", "HEC"].includes(stream);

          const subjects = isGeneralStream
            ? exam.generalSubjects || {}
            : exam.vocationalSubjects || {};

          const subjectCount = Object.keys(subjects).length;

          let maxMarksPerSub = 0;
          if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(exam.examType)) {
            maxMarksPerSub = 25;
          } else if (["QUARTERLY", "HALF-YEARLY"].includes(exam.examType)) {
            maxMarksPerSub = 50;
          } else if (["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(exam.examType)) {
            maxMarksPerSub = isGeneralStream ? 100 : 50;
          }

          const baseTotal = subjectCount * maxMarksPerSub;

          let obtained = 0;
          let result = "Pass";

          Object.entries(subjects).forEach(([_, score]) => {
            const marks = score === "A" ? 0 : parseInt(score, 10) || 0;
            obtained += marks;

            if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(exam.examType)) {
              if (score === "A" || marks < 9) result = "Fail";
            } else if (["QUARTERLY", "HALF-YEARLY"].includes(exam.examType)) {
              if (score === "A" || marks < 18) result = "Fail";
            } else if (["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(exam.examType)) {
              if (isGeneralStream) {
                if (score === "A" || marks < 35) result = "Fail";
              } else {
                if (score === "A" || marks < 18) result = "Fail";
              }
            }
          });

          const percentage = baseTotal > 0 ? (obtained / baseTotal) * 100 : 0;

          return {
            ...exam,
            total: obtained,
            percentage,
            result,
          };
        });

        if (!cancelled) {
          setExamResults(updatedExams);
          setError("");
        }
      } catch (err) {
        console.error("Server error while fetching exam results:", err);
        if (!cancelled) {
          setError("Server error while fetching exam results");
          setExamResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchExamResults();

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (loading) return <p>Loading exam results...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!examResults || examResults.length === 0)
    return <p>No exam results available.</p>;

  return (
    <div className="max-w-5xl bg-indigo-50 border border-blue-500 mx-auto p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <span>📄</span> Exam Results
      </h2>

      {examResults.map((exam) => {
        const isGeneralStream = ["MPC", "BIPC", "CEC", "HEC"].includes(exam.stream);
        const totalMax =
          (exam.stream
            ? (isGeneralStream ? 6 : 5) *
              (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(exam.examType)
                ? 25
                : ["QUARTERLY", "HALF-YEARLY"].includes(exam.examType)
                ? 50
                : isGeneralStream
                ? 100
                : 50)
            : 0);

        return (
          <div
            key={exam._id}
            className="mb-8 border border-gray-300 rounded p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <span>📝</span> {exam.examType}
            </h3>
            <p className="text-gray-700 mb-3 flex flex-wrap gap-x-4 gap-y-1">
              <span>📅 Date: {formatDate(exam.examDate)}</span>
              <span>📚 Stream: {exam.stream}</span>
              <span>🎓 Year: {exam.yearOfStudy}</span>
              <span>🗓️ Academic Year: {exam.academicYear}</span>
            </p>

            <table className="w-full border-collapse border border-gray-300 text-center text-sm">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="border border-green-700 p-2">
                    <span>📘</span> Subject
                  </th>
                  <th className="border border-green-700 p-2">
                    <span>🔢</span> Marks
                  </th>
                </tr>
              </thead>
              <tbody>
                {exam.generalSubjects &&
                  Object.entries(exam.generalSubjects).map(
                    ([subject, score]) => (
                      <tr key={subject} className="even:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-semibold">
                          <span>📘</span> {subject}
                        </td>
                        <td className="border border-gray-300 p-2">{score}</td>
                      </tr>
                    )
                  )}
                {exam.vocationalSubjects &&
                  Object.entries(exam.vocationalSubjects).map(
                    ([subject, score]) => (
                      <tr key={subject} className="even:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-semibold">
                          <span>📗</span> {subject}
                        </td>
                        <td className="border border-gray-300 p-2">{score}</td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>

            <div className="mt-4 font-semibold text-gray-800 flex flex-wrap gap-4">
              <p>
                <span>🧮 Total Marks:</span> {exam.total} / {totalMax}
              </p>
              <p>
                <span>📊 Percentage:</span> {exam.percentage.toFixed(2)}%
              </p>
              <p>
                <span>🏁 Result:</span>{" "}
                <span
                  className={
                    exam.result === "Pass"
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {exam.result === "Pass" ? "✅ Pass" : "❌ Fail"}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
