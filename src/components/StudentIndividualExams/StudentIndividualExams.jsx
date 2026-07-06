"use client";

import React, { useEffect, useState } from "react";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN");
}

const GENERAL_STREAMS = ["MPC", "BIPC", "CEC", "HEC"];
const UNIT_TYPES      = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"];
const HALF_TYPES      = ["QUARTERLY", "HALF-YEARLY", "HALFYEARLY"];
const PRE_PUB_TYPES   = ["PRE-PUBLIC-1", "PRE-PUBLIC-2"];

function getMaxMarksPerSubject(examType, isGeneral) {
  if (UNIT_TYPES.includes(examType))  return 25;
  if (HALF_TYPES.includes(examType))  return 50;
  if (PRE_PUB_TYPES.includes(examType)) return isGeneral ? 100 : 50;
  return 0;
}

function getPassMark(examType, isGeneral) {
  if (UNIT_TYPES.includes(examType))  return 9;
  if (HALF_TYPES.includes(examType))  return 18;
  if (PRE_PUB_TYPES.includes(examType)) return isGeneral ? 35 : 18;
  return 0;
}

// Array of objects [{subject, marks, _id}] → computed result
function computeExamStats(exam) {
  const isGeneral  = GENERAL_STREAMS.includes(exam.stream);
  const subjectsArr = isGeneral
    ? (exam.generalSubjects  || [])
    : (exam.vocationalSubjects || []);

  const maxPerSub = getMaxMarksPerSubject(exam.examType, isGeneral);
  const passMark  = getPassMark(exam.examType, isGeneral);
  const maxTotal  = subjectsArr.length * maxPerSub;

  let obtained = 0;
  let result   = "Pass";

  subjectsArr.forEach(({ marks }) => {
    const m = (marks === "A" || marks === "AB") ? 0 : (parseInt(marks, 10) || 0);
    obtained += m;
    if (marks === "A" || marks === "AB" || m < passMark) result = "Fail";
  });

  const percentage = maxTotal > 0 ? (obtained / maxTotal) * 100 : 0;

  return { ...exam, total: obtained, percentage, result, maxMarks: maxTotal, isGeneral, subjectsArr };
}

export default function StudentIndividualExams({ studentId }) {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res  = await fetch(`/api/exams/student/${studentId}`, { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          if (!cancelled) { setError(json?.error || "Failed to fetch exam results"); }
          return;
        }

        if (!cancelled) {
          setExamResults((json || []).map(computeExamStats));
        }
      } catch (err) {
        console.error("Exam fetch error:", err);
        if (!cancelled) setError("Server error while fetching exam results");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [studentId]);

  // ── States ───────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <span className="ml-3 text-sm text-gray-500">Loading exam results...</span>
      </div>
    );

  if (error)
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    );

  if (examResults.length === 0)
    return (
      <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-center text-yellow-700">
        📭 No exam results available yet.
      </div>
    );

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl rounded border border-blue-500 bg-indigo-50 p-4 shadow">
      <h2 className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-blue-800">
        📄 Exam Results
      </h2>

      {examResults.map((exam) => {
        const { subjectsArr, isGeneral } = exam;
        const subjectIcon = isGeneral ? "📘" : "📗";

        return (
          <div
            key={exam._id}
            className="mb-8 rounded border border-gray-300 p-6 shadow-sm bg-white"
          >
            {/* Header */}
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-gray-800">
              📝 {exam.examType}
            </h3>

            {/* Meta */}
            <p className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>📅 Date: {formatDate(exam.examDate)}</span>
              <span>📚 Stream: {exam.stream}</span>
              <span>🎓 Year: {exam.yearOfStudy}</span>
              <span>🗓️ Academic Year: {exam.academicYear}</span>
            </p>

            {/* Subjects Table */}
            <table className="w-full border-collapse border border-gray-300 text-center text-sm">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="border border-green-700 p-2">📘 Subject</th>
                  <th className="border border-green-700 p-2">🔢 Marks</th>
                  <th className="border border-green-700 p-2">📋 Max</th>
                  <th className="border border-green-700 p-2">🏁 Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectsArr.map(({ subject, marks, maxMarks: subMax }, i) => {
                  const maxPerSub   = subMax || getMaxMarksPerSubject(exam.examType, isGeneral);
                  const passMark    = getPassMark(exam.examType, isGeneral);
                  const isAbsent    = marks === "A" || marks === "AB";
                  const numMarks    = isAbsent ? 0 : (parseInt(marks, 10) || 0);
                  const subjectPass = !isAbsent && numMarks >= passMark;

                  return (
                    <tr key={`${subject}-${i}`} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="border border-gray-300 p-2 font-semibold text-left pl-4">
                        {subjectIcon} {subject}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {isAbsent ? (
                          <span className="font-bold text-orange-500">Absent</span>
                        ) : (
                          <span className={numMarks < passMark ? "font-bold text-red-600" : ""}>
                            {marks}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-gray-500">{maxPerSub}</td>
                      <td className="border border-gray-300 p-2">
                        {isAbsent ? (
                          <span className="font-bold text-orange-500">🟠 Absent</span>
                        ) : subjectPass ? (
                          <span className="font-bold text-green-600">✅ Pass</span>
                        ) : (
                          <span className="font-bold text-red-600">❌ Fail</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-4 flex flex-wrap gap-4 rounded bg-gray-100 p-3 text-sm font-semibold text-gray-800">
              <p>🧮 Total: <span className="text-blue-700">{exam.total} / {exam.maxMarks}</span></p>
              <p>📊 Percentage: <span className="text-blue-700">{exam.percentage.toFixed(2)}%</span></p>
              <p>
                🏁 Result:{" "}
                <span className={exam.result === "Pass" ? "text-green-600" : "text-red-600"}>
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