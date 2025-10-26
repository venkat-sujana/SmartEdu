"use client";
import React, { useState, useMemo } from "react";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ExamFailureTable({ reports = [], enableFilters = false }) {
  const [examType, setExamType] = useState("");
  const [year, setYear] = useState("");
  const [stream, setStream] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("examType");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Helper: get failed subjects
  const getFailedSubjects = (report) => {
    const failedSubjects = [];
    const subjectMarks = report.generalSubjects || report.vocationalSubjects || {};
    const examType = report.examType;
    for (const [subject, mark] of Object.entries(subjectMarks)) {
      const markStr = String(mark).toUpperCase();
      if (markStr === "A" || markStr === "AB" || Number(mark) === 0) {
        failedSubjects.push(subject);
        continue;
      }
      const numericMark = Number(mark);
      if (!isNaN(numericMark)) {
        if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(examType) && numericMark < 9)
          failedSubjects.push(subject);
        if (["QUARTERLY", "HALFYEARLY"].includes(examType) && numericMark < 18)
          failedSubjects.push(subject);
        if (["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(examType) && numericMark < 35)
          failedSubjects.push(subject);
      }
    }
    return failedSubjects;
  };

  // Filters & memoize
  const filteredReports = useMemo(() => {
    let result = reports.map((r) => ({
      ...r,
      failedSubjects: getFailedSubjects(r),
    }));
    result = result.filter((r) => r.failedSubjects.length > 0);
    if (enableFilters) {
      result = result
        .filter((r) => (examType ? r.examType === examType : true))
        .filter((r) => (year ? r.yearOfStudy === year : true))
        .filter((r) => (stream ? r.stream === stream : true))
        .filter((r) =>
          search
            ? (r.studentId?.name || "").toLowerCase().includes(search.toLowerCase())
            : true
        );
    }
    return result;
  }, [reports, examType, year, stream, search, enableFilters]);

  // Sorting
  const sortedReports = [...filteredReports].sort((a, b) => {
    let valA = a[sortBy] || "";
    let valB = b[sortBy] || "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedReports.length / rowsPerPage) || 1;
  const paginatedReports = sortedReports.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Export Excel
  const exportExcel = () => {
    const ws = utils.json_to_sheet(
      filteredReports.map((r) => ({
        Exam: r.examType,
        Name: r.studentId?.name,
        Stream: r.stream,
        Year: r.yearOfStudy,
        AcademicYear: r.academicYear,
        FailedSubjects: r.failedSubjects.join(", "),
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Failures");
    writeFile(wb, "ExamFailures.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Exam Failure Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["Exam", "Name", "Stream", "Year", "Academic Year", "Failed Subjects"]],
      body: filteredReports.map((r) => [
        r.examType,
        r.studentId?.name,
        r.stream,
        r.yearOfStudy,
        r.academicYear,
        r.failedSubjects.join(", "),
      ]),
    });
    doc.save("ExamFailures.pdf");
  };

  return (
    <div className="mt-2 bg-gradient-to-br from-red-50 via-white to-blue-50 p-6 rounded-2xl shadow-2xl max-w-7xl mx-auto">
      {/* Filters section */}
      {enableFilters && (
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <input
            type="text"
            placeholder="🔍 Search student..."
            className="border-2 border-blue-400 rounded-xl px-3 py-2 text-base focus:ring-2 focus:ring-blue-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={examType} onChange={e => setExamType(e.target.value)} className="border-2 border-blue-400 rounded-xl px-3 py-2 bg-white text-base">
            <option value="">All Exams</option>
            <option value="UNIT-1">UNIT-1</option>
            <option value="UNIT-2">UNIT-2</option>
            <option value="UNIT-3">UNIT-3</option>
            <option value="UNIT-4">UNIT-4</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="HALFYEARLY">Halfyearly</option>
            <option value="PRE-PUBLIC-1">Pre-Public-1</option>
            <option value="PRE-PUBLIC-2">Pre-Public-2</option>
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="border-2 border-blue-400 rounded-xl px-3 py-2 bg-white text-base">
            <option value="">All Years</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
          </select>
          <select value={stream} onChange={e => setStream(e.target.value)} className="border-2 border-blue-400 rounded-xl px-3 py-2 bg-white text-base">
            <option value="">All Streams</option>
            <option value="MPC">MPC</option>
            <option value="BIPC">BIPC</option>
            <option value="CEC">CEC</option>
            <option value="HEC">HEC</option>
            <option value="M&AT">M&AT</option>
            <option value="CET">CET</option>
            <option value="MLT">MLT</option>
          </select>
          <button onClick={exportExcel} className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">Excel</button>
          <button onClick={exportPDF} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow">PDF</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border mt-4">
        <table className="min-w-full border-none">
          <thead className="bg-gradient-to-r from-red-400 via-orange-300 to-blue-200 text-white sticky top-0 z-10">
            <tr>
              <th className="py-3 px-3">#</th>
              <th className="py-3 px-3 text-left">Exam</th>
              <th className="py-3 px-3 text-left">Student</th>
              <th className="py-3 px-3">Stream</th>
              <th className="py-3 px-3">Year</th>
              <th className="py-3 px-3">Academic Year</th>
              <th className="py-3 px-3">Failed Subjects</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400 italic">No failures found</td>
              </tr>
            ) : (
              paginatedReports.map((report, idx) => (
                <tr key={report._id} className="hover:bg-blue-50 border-b last:border-0 transition-all">
                  <td className="py-2 px-3 text-center font-semibold">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                  <td className="py-2 px-3 text-left font-semibold text-blue-900">{report.examType}</td>
                  <td className="py-2 px-3 text-left">{report.studentId?.name || "-"}</td>
                  <td className="py-2 px-3 text-center">{report.stream}</td>
                  <td className="py-2 px-3 text-center">{report.yearOfStudy}</td>
                  <td className="py-2 px-3 text-center">{report.academicYear}</td>
                  <td className="py-2 px-3 text-left">
                    <div className="flex flex-wrap gap-2">
                      {report.failedSubjects.map((subject, i) => (
                        <span key={i} className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs font-bold shadow">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-between items-center mt-8 gap-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-5 py-2 bg-blue-200 text-blue-900 rounded-lg shadow font-bold disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="text-lg text-gray-700 font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow font-bold disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
