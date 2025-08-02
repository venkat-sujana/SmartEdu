//app/exam-report/page.jsx
"use client";
import { NextResponse } from "next/server";
import { useEffect, useState } from "react";
import Link from "next/link";
import EditExamForm from "@/app/edit-exam-form/page"; // Adjust the import path as needed
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

  

  const [editingExam, setEditingExam] = useState(null);

  const { data: session } = useSession();
console.log("SESSION: ", session);

const [collegeId, setCollegeId] = useState('');
const [collegeName, setCollegeName] = useState('');

  
  useEffect(() => {
    if (session?.user?.collegeId) {
      setCollegeId(session.user.collegeId);
    }
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName);
    }
  }, [session]);


  // Move fetchReports to component scope so it can be called elsewhere
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
        const data = await res.json();
        // You can store in state if needed like: setStudents(data.data)
      } catch (err) {
        console.error("Error loading students:", err);
      }
    };

    fetchReports();
    fetchStudents();
  }, []);

  const filteredReports = reports.filter((report) => {
    const studentNameMatch = filters.studentName
      ? report.student?.name
          ?.toLowerCase()
          .includes(filters.studentName.toLowerCase())
      : true;
    const streamMatch = filters.stream
      ? report.stream === filters.stream
      : true;
    const yearMatch = filters.academicYear
      ? report.academicYear === filters.academicYear
      : true;
    const examMatch = filters.examType
      ? report.examType === filters.examType
      : true;
    const yearOfStudyMatch = filters.yearOfStudy
      ? report.yearOfStudy === filters.yearOfStudy
      : true;

    return (
      studentNameMatch &&
      streamMatch &&
      yearMatch &&
      examMatch &&
      yearOfStudyMatch
    );
  });

  const examTypes = [
    "UNIT-1",
    "UNIT-2",
    "UNIT-3",
    "UNIT-4",
    "QUARTERLY",
    "HALFYEARLY",
    "PRE-PUBLIC-1",
    "PRE-PUBLIC-2",
  ];

  const generalColumns = [
    "Telugu/Sanskrit",
    "English",
    "Maths/Botany/Civics",
    "Maths/Zoology/History",
    "Physics/Economics",
    "Chemistry/Commerce",
  ];
  const vocationalColumns = ["GFC", "English", "V1/V4", "V2/V5", "V3/V6"];

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      });

      const data = await res.json(); // ✅ this may throw error if response is empty

      if (res.ok && data.success) {
        alert("Deleted successfully");
        setReports((prev) => prev.filter((r) => r._id !== id));
      } else {
        console.error("Delete failed:", data);
        alert("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  const handleUpdate = async (updatedData) => {
    console.log("handleUpdate called with", updatedData);

    try {
      const response = await fetch(`/api/exams/${updatedData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      console.log("Update response:", response);

      const data = await response.json();

      console.log("Update data:", data);

      if (data.success) {
        alert("Updated successfully");

        setIsEditing(false); // Close the form after submission
        fetchReports(); // reload reports
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Something went wrong");
    }
  };

  const handleUpdated = async () => {
    await fetchExam(); // again fetch latest exam from backend
    setShowEditForm(false); // or close modal
  };

  return (
    <div className="p-6 ">
     
     <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
     <span className="font-semibold">🏫</span> {collegeName || "Loading..."}
     </div>


      <h1 className="text-2xl font-bold mb-2 flex items-center justify-center">
        Exam Summary Report
      </h1>
      <strong>
        <p className="mb-4">
          Note:-This page displays a summary of exams conducted by the
          institution. You can filter the results using the dropdowns below. To
          print the report, click on the &quot;Print Report&quot; button above.
          You can also filter the results by selecting a specific academic year,
          stream, or year of study from the dropdown menus below.
        </p>
      </strong>

      <strong>
        <p className="mb-4">
          The user should be able to:
          <br /> 1. View exam name, date, total marks, percentage.
          <br /> 2. See PASS/FAIL status based on marks.
          <br /> 3. Subjects should show “Pass” or “Fail” beside each mark based
          on rules.
          <br /> 4. Display red color for failed subjects and green for passed
          ones.
        </p>
      </strong>

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
          {examTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* {status === "loading" ? (
        <p className="text-center font-bold text-lg text-gray-600 mb-4">
          Loading college name...
        </p>
      ) : (
        <h2 className="text-center text-xl font-bold mb-4 uppercase">
          {session?.user?.collegeName || "College Name Not Available"}
        </h2>
      )} */}

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
      </div>
    </div>
  );
}
