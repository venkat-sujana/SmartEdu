'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExamReportPage() {
  // const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    studentName: '',
    stream: '',
    academicYear: '',
    examType: '',
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/exams');
        const data = await res.json();
        if (data.success) {
          setReports(data.data);
        }
      } catch (err) {
        console.error('Error loading reports:', err);
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        // if (data.data) {
        //   setStudents(data.data);
        // }
      } catch (err) {
        console.error('Error loading students:', err);
      }
    };

    fetchReports();
    fetchStudents();
  }, []);

  const filteredReports = reports.filter((report) => {
    const studentNameMatch = filters.studentName
      ? report.student?.name?.toLowerCase().includes(filters.studentName.toLowerCase())
      : true;
    const streamMatch = filters.stream ? report.stream === filters.stream : true;
    const yearMatch = filters.academicYear ? report.academicYear === filters.academicYear : true;
    const examMatch = filters.examType ? report.examType === filters.examType : true;

    return studentNameMatch && streamMatch && yearMatch && examMatch;
  });

  const examTypes = ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4', 'QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2'];
  const columns = ['Tel/Sansk', 'English', 'Math/Bot/Civ', 'Math/Zool/His', 'Phy/Eco', 'Che/Com'];

  return (
    <div className="p-6">
                    <Link href="/student-table">
                      <button className="w-50 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold mr-2">
                        📝&nbsp; Student-Table
                      </button>
                    </Link>
      <Link href="/exams-form">
        <button className="w-50 bg-teal-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
          📝&nbsp; Exams Form
        </button>
      </Link>
      <h2 className="text-2xl font-bold mb-4">Home Examinations Report</h2>

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

      {/* Report Table */}
      <table className="table-auto w-full border border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="border p-1">S.No</th>
            <th className="border p-1">Name</th>
            <th className="border p-1">Exam</th>
            {columns.map((col) => (
              <th key={col} className="border p-1">
                {col}
              </th>
            ))}
            <th className="border p-1">Total</th>
            <th className="border p-1">%</th>
            <th className="border p-1">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((report, idx) => {
            const subjectMarks =
              report.generalSubjects || report.vocationalSubjects || {};
            const total = Object.values(subjectMarks).reduce(
              (sum, val) => sum + Number(val || 0),
              0
            );
            const percentage =
              Object.keys(subjectMarks).length > 0
                ? (total / Object.keys(subjectMarks).length).toFixed(2)
                : 0;

            return (
              <tr key={idx} className="text-center border">
                <td className="border p-1">{idx + 1}</td>
                <td className="border p-1">{report.student?.name || "N/A"}</td>
                <td className="border p-1">{report.examType}</td>
                {columns.map((sub, i) => (
                  <td key={i} className="border p-1">
                    {subjectMarks[`subject${i + 1}`] || ""}
                  </td>
                ))}
                <td className="border p-1">{total}</td>
                <td className="border p-1">{percentage}</td>
                <td className="border p-1">{report.remarks || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
