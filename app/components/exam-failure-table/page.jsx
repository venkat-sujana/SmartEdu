"use client";
import React from "react";

export default function ExamFailureTable({ reports }) {
  // Helper function: get failed subjects
  const getFailedSubjects = (report) => {
    const failedSubjects = [];
    const subjectMarks = report.generalSubjects || report.vocationalSubjects || {};
    const examType = report.examType;

    for (const [subject, mark] of Object.entries(subjectMarks)) {
      const markStr = String(mark).toUpperCase();

      // Absent cases
      if (markStr === "A" || markStr === "AB" || Number(mark) === 0) {
        failedSubjects.push(subject);
        continue;
      }

      const numericMark = Number(mark);
      if (!isNaN(numericMark)) {
        if (
          ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(examType) &&
          numericMark < 9
        ) {
          failedSubjects.push(subject);
        }
        if (
          ["QUARTERLY", "HALFYEARLY"].includes(examType) &&
          numericMark < 18
        ) {
          failedSubjects.push(subject);
        }
        if (
          ["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(examType) &&
          numericMark < 35
        ) {
          failedSubjects.push(subject);
        }
      }
    }
    return failedSubjects;
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md mt-6">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-3 py-2">S.No</th>
            <th className="border px-3 py-2">Exam Type</th>
            <th className="border px-3 py-2">Student Name</th>
            <th className="border px-3 py-2">Stream</th>
            <th className="border px-3 py-2">Year of Study</th>
            <th className="border px-3 py-2">Academic Year</th>
            <th className="border px-3 py-2">Failed Subjects</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => {
            const failedSubjects = getFailedSubjects(report);

            if (failedSubjects.length === 0) return null; // only show failures

            return (
              <tr key={report._id || index} className="hover:bg-gray-50">
                <td className="border px-3 py-2 text-center">{index + 1}</td>
                <td className="border px-3 py-2">{report.examType}</td>
                <td className="border px-3 py-2">{report.student?.name || "-"}</td>
                <td className="border px-3 py-2">{report.stream || "-"}</td>
                <td className="border px-3 py-2 text-center">
                  {report.yearOfStudy || "-"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {report.academicYear || "-"}
                </td>
                <td className="border px-3 py-2 text-red-600 font-medium">
                  {failedSubjects.join(", ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
