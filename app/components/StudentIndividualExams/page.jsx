// app/components/StudentIndividualExams/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

export default function StudentIndividualExams({ studentId }) {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session, status } = useSession();

  console.log("Session", session);
  console.log("Status", status);

  useEffect(() => {
    if (!studentId) return;

    async function fetchExamResults() {
      try {
        setLoading(true);
        const res = await fetch(`/api/exams/student/${studentId}`);
        const json = await res.json();

        if (res.ok) {
          const updatedExams = (json || []).map((exam) => {
            let baseTotal = 0;
            let passMarks = 0;

            // ✅ Base total calculation
            if (["MPC", "BIPC", "CEC", "HEC"].includes(exam.stream)) {
              if (exam.examType?.toLowerCase().includes("unit")) {
                baseTotal = 6 * 25; // 150
                passMarks = 9;
              } else if (
                exam.examType === "Quarterly" ||
                exam.examType === "Half-Yearly"
              ) {
                baseTotal = 6 * 50; // 300
                passMarks = 18;
              } else if (
                exam.examType === "Prepublic-1" ||
                exam.examType === "Prepublic-2"
              ) {
                baseTotal = 6 * 100; // 600
                passMarks = 35;
              }
            }

            if (["M&AT", "CET", "MLT"].includes(exam.stream)) {
              if (exam.examType?.toLowerCase().includes("unit")) {
                baseTotal = 5 * 25; // 125
                passMarks = 9;
              } else if (
                exam.examType === "Quarterly" ||
                exam.examType === "Half-Yearly"
              ) {
                baseTotal = 5 * 50; // 250
                passMarks = 18;
              } else if (
                exam.examType === "Prepublic-1" ||
                exam.examType === "Prepublic-2"
              ) {
                baseTotal = 250; // ✅ Vocational prepublic = 250
                passMarks = 18;
              }
            }

            const totalMarks = exam.total || 0;
            const percentage =
              baseTotal > 0 ? (totalMarks / baseTotal) * 100 : 0;

            // ✅ Subject-wise fail check
            let isFail = false;
            let subjects =
              ["MPC", "BIPC", "CEC", "HEC"].includes(exam.stream)
                ? exam.generalSubjects
                : exam.vocationalSubjects;

            if (subjects) {
              for (const [sub, mark] of Object.entries(subjects)) {
                if (mark === "A" || (typeof mark === "number" && mark < passMarks)) {
                  isFail = true;
                  break;
                }
              }
            }

            return {
              ...exam,
              percentage,
              result: isFail ? "Fail" : "Pass",
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
                <th className="border border-green-700 p-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ General Streams */}
              {["MPC", "BIPC", "CEC", "HEC"].includes(exam.stream) &&
              exam.generalSubjects &&
              Object.entries(exam.generalSubjects).length > 0 ? (
                Object.entries(exam.generalSubjects).map(
                  ([subject, score]) => (
                    <tr key={subject} className="even:bg-gray-50">
                      <td className="border border-gray-300 p-2 font-semibold">
                        {subject}
                      </td>
                      <td
                        className={`border border-gray-300 p-2 ${
                          score === "A" || (typeof score === "number" &&
                          score < (exam.examType?.toLowerCase().includes("unit")
                            ? 9
                            : exam.examType === "Quarterly" ||
                              exam.examType === "Half-Yearly"
                            ? 18
                            : 35))
                            ? "text-red-600 font-bold"
                            : ""
                        }`}
                      >
                        {score}
                      </td>
                    </tr>
                  )
                )
              ) : null}

              {/* ✅ Vocational Streams */}
              {["M&AT", "CET", "MLT"].includes(exam.stream) &&
              exam.vocationalSubjects &&
              Object.entries(exam.vocationalSubjects).length > 0 ? (
                Object.entries(exam.vocationalSubjects).map(
                  ([subject, score]) => (
                    <tr key={subject} className="even:bg-gray-50">
                      <td className="border border-gray-300 p-2 font-semibold">
                        {subject}
                      </td>
                      <td
                        className={`border border-gray-300 p-2 ${
                          score === "A" || (typeof score === "number" &&
                          score < (exam.examType?.toLowerCase().includes("unit")
                            ? 9
                            : exam.examType === "Quarterly" ||
                              exam.examType === "Half-Yearly"
                            ? 18
                            : 18))
                            ? "text-red-600 font-bold"
                            : ""
                        }`}
                      >
                        {score}
                      </td>
                    </tr>
                  )
                )
              ) : null}
            </tbody>
          </table>

          <div className="mt-4 font-semibold text-gray-800">
            <p>Total Marks: {exam.total}</p>
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
