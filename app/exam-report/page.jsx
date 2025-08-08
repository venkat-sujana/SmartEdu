//app/exam-report/page.jsx
"use client";
import { NextResponse } from "next/server";
import { useEffect, useState } from "react";
import Link from "next/link";
import EditExamForm from "@/app/edit-exam-form/page";
import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

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
    "UNIT-1",
    "UNIT-2",
    "UNIT-3",
    "UNIT-4",
    "QUARTERLY",
    "HALFYEARLY",
    "PRE-PUBLIC-1",
    "PRE-PUBLIC-2",
  ]);

  const [editingExam, setEditingExam] = useState(null);

  const { data: session } = useSession();
  const [collegeId, setCollegeId] = useState("");
  const [collegeName, setCollegeName] = useState("");

  const[generalColumns, setGeneralColumns] = useState([
    "Telugu/Sanskrit",
    "English",
    "Maths/Botany/Civics",
    "Maths/Zoology/History",
    "Physics/Economics",
    "Chemistry/Commerce",
  ]);

  const[vocationalColumns, setVocationalColumns] = useState([
    "GFC",
    "English",
    "V1/V4",
    "V2/V5",
    "V3/V6",
  ]);

  useEffect(() => {
    if (session?.user?.collegeId) {
      setCollegeId(session.user.collegeId);
    }
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName);
    }
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

  // Handle delete exam report
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      });
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

  // Compute pass/fail counts
  const { passCount, failCount, passPercentage } = (() => {
    let pass = 0, fail = 0;
    for (const report of filteredReports) {
      const subjectMarks = report.generalSubjects || report.vocationalSubjects || {};
      const isVocational = ["M&AT", "CET", "MLT"].includes(report.stream);

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
     <Toaster />

      <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
        <span className="font-semibold">🏫</span>
        <span className="ml-2">{collegeName || "Loading..."}</span>
      </div>


    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Exam Summary Report</h1>


    
      {/* Summary Stats */}
      <div className="mb-4 flex flex-col sm:flex-row justify-center items-center gap-4 bg-gray-100 p-4 rounded-md shadow-inner">
        <div className="text-green-700 font-semibold">✅ Passed: {passCount}</div>
        <div className="text-red-700 font-semibold">❌ Failed: {failCount}</div>
        <div className="text-blue-700 font-semibold">📊 Pass %: {passPercentage}%</div>
      </div>

      <Link href="/student-table">
        <button className="w-50 bg-cyan-600 mb-2 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold mr-2">
          📝&nbsp; Student-Table
        </button>
      </Link>

      <Link href="/exams-form">
        <button className="w-50 bg-teal-600 mb-2 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold mr-2">
          📝&nbsp; Exams Form
        </button>
      </Link>

      <button
        onClick={() => window.print()}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-bold mb-4 cursor-pointer"
      >
        🖨️ Print Report
      </button>

      <h1 className="text-2xl font-bold mb-4 flex items-center justify-center ">
        Home Examinations Report
      </h1>


        {editingExam && (
          <EditExamForm
            key={editingExam._id} // 👉 Reactకు కొత్త component అన్నట్టు చెప్పే key
            examData={editingExam}
            onClose={() => setEditingExam(null)}
            onUpdated={fetchReports}
          />
        )}

        <div className="mt-4">
          {filteredReports.length === 0 && (
            <p className="text-center text-gray-500">No reports found</p>
          )}
        </div>



      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section,
          #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search Student"
          value={filters.studentName}
          onChange={(e) =>
            setFilters({ ...filters, studentName: e.target.value })
          }
          className="border p-2 rounded"
        />
        <select
          value={filters.stream}
          onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Streams</option>
          {["MPC", "BIPC", "CEC", "HEC", "M&AT", "CET", "MLT"].map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>
        <select
          value={filters.academicYear}
          onChange={(e) =>
            setFilters({ ...filters, academicYear: e.target.value })
          }
          className="border p-2 rounded"
        >
          <option value="">All Years</option>
          <option value="2025-1">First Year</option>
          <option value="2025-2">Second Year</option>
        </select>
        <select
          value={filters.examType}
          onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Exam Types</option>
          {examType.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>


      <div id="print-section">
        {/* Report Table */}
        <table className="table-auto w-full border border-black m-4">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border p-1">S.No</th>
              <th className="border p-1">Name</th>
              <th className="border p-1">Exam</th>
              <th className="border p-1">Year</th>

              {(filteredReports[0]?.stream &&
              ["M&AT", "CET", "MLT"].includes(filteredReports[0].stream)
                ? vocationalColumns
                : generalColumns
              ).map((col, i) => (
                <th key={i} className="border p-1">
                  {col}
                </th>
              ))}
              <th className="border p-1">Total</th>
              <th className="border p-1">%</th>
              <th className="border p-1">Status</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.map((report, idx) => {
              const subjectMarks =
                report.generalSubjects || report.vocationalSubjects || {};
              const isVocational = ["M&AT", "CET", "MLT"].includes(
                report.stream
              );
              const columnsToRender = isVocational
                ? vocationalColumns
                : generalColumns;

              // Check for "A", "AB", or 0
              let isFail = false;

              for (const mark of Object.values(subjectMarks)) {
                const markStr = String(mark).toUpperCase();

                // Check for absent (A/AB) or zero marks
                if (markStr === "A" || markStr === "AB" || Number(mark) === 0) {
                  isFail = true;
                  break;
                }

                const numericMark = Number(mark);
                if (!isNaN(numericMark)) {
                  // Unit tests (max marks 25) - fail if <9
                  if (
                    ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(
                      report.examType
                    ) &&
                    numericMark < 9
                  ) {
                    isFail = true;
                    break;
                  }

                  // Quarterly/Halfyearly (max marks 50) - fail if <18
                  if (
                    ["QUARTERLY", "HALFYEARLY"].includes(report.examType) &&
                    numericMark < 18
                  ) {
                    isFail = true;
                    break;
                  }

                  // Pre-public (max marks 100) - fail if <35
                  if (
                    ["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(
                      report.examType
                    ) &&
                    numericMark < 35
                  ) {
                    isFail = true;
                    break;
                  }
                }
              }

              // Calculate subjectCount once before percentage calculation

              // Step 1: Total marks
              const total = Object.values(subjectMarks).reduce((sum, val) => {
                if (val === "A" || val === "AB") return sum;
                return sum + Number(val || 0);
              }, 0);

              // Step 2: Subjects shown in UI
              const subjectCount = columnsToRender.length;

              // Step 3: Max marks per subject
              let maxMarksPerSubject = 0;
              if (
                ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(
                  report.examType
                )
              ) {
                maxMarksPerSubject = 25;
              } else if (
                ["QUARTERLY", "HALFYEARLY"].includes(report.examType)
              ) {
                maxMarksPerSubject = 50;
              } else {
                maxMarksPerSubject = 100;
              }

              // Step 4: Calculate and format percentage in one line
              const percentage =
                subjectCount > 0
                  ? (
                      (total / (subjectCount * maxMarksPerSubject)) *
                      100
                    ).toFixed(2)
                  : "0.00";

              const status = isFail ? "Fail" : "Pass";

              const rowClass =
                status === "Fail" ? "bg-red-100" : "bg-green-100";

              return (
                <tr key={idx} className={`text-center border ${rowClass}`}>
                  <td className="border p-1">{idx + 1}</td>
                  <td className="border p-1">
                    {report.student?.name || "N/A"}
                  </td>
                  <td className="border p-1">{report.examType}</td>
                  <td className="border p-1">{report.yearOfStudy || "N/A"}</td>

                  {columnsToRender.map((subject, i) => (
                    <td key={i} className="border p-1">
                      {subjectMarks[subject] !== undefined &&
                      subjectMarks[subject] !== null
                        ? subjectMarks[subject]
                        : ""}
                    </td>
                  ))}

                  <td className="border p-1">{total}</td>
                  <td className="border p-1">{percentage}</td>
                  <td className="border p-1">{status}</td>
                  <td className="border p-1">
                    <button
                      onClick={() => setEditingExam(report)} // report = exam object
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(report._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded ml-2"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* {editingExam && (
          <EditExamForm
            key={editingExam._id} // 👉 Reactకు కొత్త component అన్నట్టు చెప్పే key
            examData={editingExam}
            onClose={() => setEditingExam(null)}
            onUpdated={fetchReports}
          />
        )}

        <div className="mt-4">
          {filteredReports.length === 0 && (
            <p className="text-center text-gray-500">No reports found</p>
          )}
        </div> */}
      </div>
    </div>
  );
}
