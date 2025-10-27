//app/exam-report/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import EditExamForm from "@/app/edit-exam-form/page";
import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import ExamFailureTable from "@/app/components/exam-failure-table/page";

import {
  Calendar,
  Users,
  FileText,
  Edit,
  BarChart,
  ClipboardList,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Home,
} from 'lucide-react';

export default function ExamReportPage() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    studentName: "",
    stream: "",
    academicYear: "",
    examType: "",
    yearOfStudy: "",
  });
  const [examType, setExamType] = useState([
    "UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4", 
    "QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2",
  ]);
  const [editingExam, setEditingExam] = useState(null);
  const { data: session } = useSession();
  const [collegeId, setCollegeId] = useState("");
  const [collegeName, setCollegeName] = useState("");

  const [generalColumns, setGeneralColumns] = useState([
    "Telugu/Sanskrit", "English", "Maths/Botany/Civics",
    "Maths/Zoology/History", "Physics/Economics", "Chemistry/Commerce",
  ]);

  const [vocationalColumns, setVocationalColumns] = useState([
    "GFC", "English", "V1/V4", "V2/V5", "V3/V6",
  ]);

  useEffect(() => {
    if (session?.user?.collegeId) setCollegeId(session.user.collegeId);
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/exams");
      let data = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = {};
      }
      if (data.success) {
        setReports(data.data);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        await res.json();
      } catch (err) {
        console.error("Error loading students:", err);
      }
    };
    fetchReports();
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert("Failed to delete report.");
      }
    } catch (err) {
      alert("Error deleting report.");
      console.error(err);
    }
  };

  const filteredReports = reports.filter((report) => {
    const studentNameMatch = filters.studentName
      ? report.student?.name?.toLowerCase().includes(filters.studentName.toLowerCase())
      : true;
    const streamMatch = filters.stream ? report.stream === filters.stream : true;
    const yearMatch = filters.academicYear ? report.academicYear === filters.academicYear : true;
    const examMatch = filters.examType ? report.examType === filters.examType : true;
    const yearOfStudyMatch = filters.yearOfStudy ? report.yearOfStudy === filters.yearOfStudy : true;
    return studentNameMatch && streamMatch && yearMatch && examMatch && yearOfStudyMatch;
  });

  // Group by Exam Type then by Year
  function groupByExamAndYear(reports) {
    const out = {};
    reports.forEach((item) => {
      const exam = item.examType || "N/A";
      const year = item.yearOfStudy || "N/A";
      if (!out[exam]) out[exam] = {};
      if (!out[exam][year]) out[exam][year] = [];
      out[exam][year].push(item);
    });
    return out;
  }

  const examYearReports = groupByExamAndYear(filteredReports);

  // Calculate Pass/Fail stats
  const { passCount, failCount, passPercentage } = (() => {
    let pass = 0, fail = 0;
    for (const report of filteredReports) {
      const subjectMarks = report.generalSubjects || report.vocationalSubjects || {};
      let isFail = false;
      for (const mark of Object.values(subjectMarks)) {
        const markStr = String(mark).toUpperCase();
        if (markStr === "A" || markStr === "AB" || Number(mark) === 0) {
          isFail = true;
          break;
        }
        const numericMark = Number(mark);
        if (!isNaN(numericMark)) {
          if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(report.examType) && numericMark < 9) {
            isFail = true;
            break;
          }
          if (["QUARTERLY", "HALFYEARLY"].includes(report.examType) && numericMark < 18) {
            isFail = true;
            break;
          }
          if (["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(report.examType) && numericMark < 35) {
            isFail = true;
            break;
          }
        }
      }
      if (isFail) fail++;
      else pass++;
    }
    const total = pass + fail;
    const percentage = total > 0 ? ((pass / total) * 100).toFixed(2) : "0.00";
    return { passCount: pass, failCount: fail, passPercentage: percentage };
  })();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
      <Toaster />

      {/* College Header */}
      <div className="mb-6 px-6 py-4 bg-gradient-to-r from-blue-100 to-green-100 border-2 border-blue-200 text-blue-800 rounded-2xl shadow-lg flex items-center justify-center font-bold text-xl">
        <span className="text-2xl mr-3">🏫</span>
        <span>{collegeName || "Loading..."}</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-blue-900 tracking-tight">
        📊 Exam Summary Dashboard
      </h1>

      {/* Summary Stats Cards */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">

        <div className="bg-green-50 border-2 border-green-200 rounded-xl px-8 py-5 text-center shadow-lg min-w-[120px]">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-700">{passCount}</div>
          <div className="text-sm font-semibold text-green-800">Passed</div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl px-8 py-5 text-center shadow-lg min-w-[120px]">
          <div className="text-3xl mb-2">❌</div>
          <div className="text-2xl font-bold text-red-700">{failCount}</div>
          <div className="text-sm font-semibold text-red-800">Failed</div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-8 py-5 text-center shadow-lg min-w-[120px] mr-8">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-blue-700">{passPercentage}%</div>
          <div className="text-sm font-semibold text-blue-800">Pass Rate</div>
        </div>

                <div className="mb-4 flex justify-end">
                  <Link href="/attendance-dashboard">
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700 cursor-pointer font-bold">
                      <Home className="w-5 h-5" /> Back to  Dashboard
                    </button>
                  </Link>
                </div>



      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Link href="/student-table">
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition shadow-lg font-semibold">
            👥 Student Table
          </button>
        </Link>
        <Link href="/exams-form">
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition shadow-lg font-semibold">
            📝 Exam Form
          </button>
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition shadow-lg font-semibold"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search Student Name"
          value={filters.studentName}
          onChange={(e) => setFilters({ ...filters, studentName: e.target.value })}
          className="border-2 border-blue-400 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
        />
        <select
          value={filters.stream}
          onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
          className="border-2 border-blue-400 rounded-xl px-4 py-3 bg-white text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
        >
          <option value="">All Streams</option>
          {["MPC", "BIPC", "CEC", "HEC", "M&AT", "CET", "MLT"].map((stream) => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
        </select>
        <select
          value={filters.academicYear}
          onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
          className="border-2 border-blue-400 rounded-xl px-4 py-3 bg-white text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
        >
          <option value="">All Academic Years</option>
          <option value="2025-1">First Year</option>
          <option value="2025-2">Second Year</option>
        </select>
        <select
          value={filters.examType}
          onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
          className="border-2 border-blue-400 rounded-xl px-4 py-3 bg-white text-base focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
        >
          <option value="">All Exam Types</option>
          {examType.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Edit Form Modal */}
      {editingExam && (
        <EditExamForm
          key={editingExam._id}
          examData={editingExam}
          onClose={() => setEditingExam(null)}
          onUpdated={fetchReports}
        />
      )}

      {/* Grouped Tables by Exam Type and Year */}
      <div className="space-y-12" id="print-section">
        {Object.keys(examYearReports).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <div className="text-xl text-gray-500">No exam reports found</div>
          </div>
        ) : (
          Object.entries(examYearReports).map(([exam, years]) => (
            <section key={exam} className="mb-12">
              {/* Exam Type Header */}
              <div className="text-2xl font-bold mb-6 text-indigo-700 flex items-center justify-center gap-3">
                <span className="inline-block bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 px-6 py-3 rounded-2xl shadow-lg text-center">
                  📚 {exam}
                </span>
              </div>

              {/* Year-wise Tables Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(years).map(([year, rows]) => (
                  <div key={year} className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-6 overflow-hidden">
                    <h4 className="font-bold text-xl mb-4 text-blue-800 text-center bg-gradient-to-r from-blue-50 to-green-50 py-2 rounded-xl">
                      🎓 {year}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-[400px] w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 text-blue-900">
                            <th className="py-3 px-2 border">S.No</th>
                            <th className="py-3 px-3 text-left border">Name</th>
                            {/* Subject Columns */}
                            {(rows[0]?.stream && ["M&AT", "CET", "MLT"].includes(rows[0].stream)
                              ? vocationalColumns
                              : generalColumns
                            ).map((col, i) => (
                              <th key={i} className="py-3 px-2 text-center border text-xs">{col}</th>
                            ))}
                            <th className="py-3 px-2 border">Total</th>
                            <th className="py-3 px-2 border">%</th>
                            <th className="py-3 px-2 border">Status</th>
                            <th className="py-3 px-2 border">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-8 text-center text-gray-400 italic">
                                No records for {year} in {exam}
                              </td>
                            </tr>
                          ) : (
                            rows.map((report, idx) => {
                              const subjectMarks = report.generalSubjects || report.vocationalSubjects || {};
                              const isVocational = ["M&AT", "CET", "MLT"].includes(report.stream);
                              const columnsToRender = isVocational ? vocationalColumns : generalColumns;

                              let isFail = false;
                              for (const mark of Object.values(subjectMarks)) {
                                const markStr = String(mark).toUpperCase();
                                if (markStr === "A" || markStr === "AB" || Number(mark) === 0) {
                                  isFail = true;
                                  break;
                                }
                                const numericMark = Number(mark);
                                if (!isNaN(numericMark)) {
                                  if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(report.examType) && numericMark < 9) {
                                    isFail = true;
                                    break;
                                  }
                                  if (["QUARTERLY", "HALFYEARLY"].includes(report.examType) && numericMark < 18) {
                                    isFail = true;
                                    break;
                                  }
                                  if (["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(report.examType) && numericMark < 35) {
                                    isFail = true;
                                    break;
                                  }
                                }
                              }

                              const total = Object.values(subjectMarks).reduce((sum, val) => {
                                if (val === "A" || val === "AB") return sum;
                                return sum + Number(val || 0);
                              }, 0);

                              const subjectCount = columnsToRender.length;
                              let maxMarksPerSubject = 100;
                              if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(report.examType)) {
                                maxMarksPerSubject = 25;
                              } else if (["QUARTERLY", "HALFYEARLY"].includes(report.examType)) {
                                maxMarksPerSubject = 50;
                              }

                              const percentage = subjectCount > 0
                                ? ((total / (subjectCount * maxMarksPerSubject)) * 100).toFixed(2)
                                : "0.00";

                              const status = isFail ? "Fail" : "Pass";
                              const rowClass = status === "Fail" ? "bg-red-50" : "bg-green-50";

                              return (
                                <tr key={idx} className={`text-center ${rowClass} hover:bg-yellow-50 transition border-b`}>
                                  <td className="py-2 px-2 border font-medium">{idx + 1}</td>
                                  <td className="py-2 px-3 text-left border font-medium">{report.student?.name || "N/A"}</td>
                                  
                                  {columnsToRender.map((subject, i) => (
                                    <td key={i} className="py-2 px-2 border text-xs">
                                      {subjectMarks[subject] !== undefined && subjectMarks[subject] !== null 
                                        ? subjectMarks[subject] 
                                        : "-"}
                                    </td>
                                  ))}
                                  
                                  <td className="py-2 px-2 border font-bold">{total}</td>
                                  <td className="py-2 px-2 border font-bold">{percentage}</td>
                                  <td className="py-2 px-2 border">
                                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                                      status === "Fail" 
                                        ? "bg-red-200 text-red-800" 
                                        : "bg-green-200 text-green-800"
                                    }`}>
                                      {status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 border space-x-1">
                                    <button
                                      onClick={() => setEditingExam(report)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs transition"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(report._id)}
                                      className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-xs transition"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Failure Summary */}
      <div className="mt-12">
        <ExamFailureTable reports={filteredReports} />
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
