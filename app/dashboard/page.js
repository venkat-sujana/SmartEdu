"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Link from "next/link";
import AdmissionCharts from "./components/AdmissionCharts";

import {
  Users,
  FileDown,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";
import GenderWiseChart from "./components/GenderWiseChart";
import CasteWiseChart from "./components/CasteWisechart";

export default function GroupDashboard() {
  const [students, setStudents] = useState([]);
  const [groupCounts, setGroupCounts] = useState([]);
  const [casteCounts, setCasteCounts] = useState([]);
  const [genderCounts, setGenderCounts] = useState([]);
  const [admissionYearCounts, setAdmissionYearCounts] = useState([]);
  const [dateWiseCounts, setDateWiseCounts] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/students");
      const data = await res.json();
      const studentData = data.data || [];

      setStudents(studentData);
      setTotal(studentData.length);

      setGroupCounts(getCounts(studentData, "group"));
      setCasteCounts(getCounts(studentData, "caste"));
      setGenderCounts(getCounts(studentData, "gender"));
      setAdmissionYearCounts(getCounts(studentData, "admissionYear"));
      setDateWiseCounts(getDateWiseCounts(studentData));
    };

    fetchData();
  }, []);

  const getCounts = (data, field) => {
    const counts = {};
    data.forEach((student) => {
      const key = student[field] || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([key, count]) => ({
      key,
      count,
    }));
  };

  const getDateWiseCounts = (data) => {
    const counts = {};

    data.forEach((student) => {
      if (student.createdAt && student.group) {
        const dateObj = new Date(student.createdAt);
        if (!isNaN(dateObj.getTime())) {
          const date = dateObj.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          const group = student.group;
          const key = `${date}__${group}`; // Combine with separator
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    });

    // Convert counts object to array of objects
    const sortedEntries = Object.entries(counts).sort((a, b) => {
      const dateA = new Date(a[0].split("__")[0]);
      const dateB = new Date(b[0].split("__")[0]);
      return dateA - dateB;
    });

    return sortedEntries.map(([key, count]) => {
      const [date, group] = key.split("__");
      return {
        key: `${date} - ${group}`, // Final display key: Date - Group
        count,
      };
    });
  };

  const exportToPDF = (title, data) => {
    const doc = new jsPDF();
    doc.text(title, 14, 16);
    autoTable(doc, {
      head: [["S.No", title.split(" ")[0], "Count"]],
      body: data.map((item, idx) => [idx + 1, item.key, item.count]),
    });
    doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };

  const exportToExcel = (title, data) => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item, idx) => ({
        SNo: idx + 1,
        [title.split(" ")[0]]: item.key,
        Count: item.count,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_").toLowerCase()}.xlsx`);
  };

  const renderTable = (title, data) => {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    return (
      <div className="mb-10 border shadow rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>

        {data.length === 0 ? (
          <p className="text-center text-red-500 font-medium">No data found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="border px-4 py-2 text-left font-bold">
                      S.No
                    </th>
                    <th className="border px-4 py-2 text-left font-bold">
                      {title.split(" ")[0]}
                    </th>
                    <th className="border px-4 py-2 text-left font-bold">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.key} className="border-t">
                      <td className="border px-4 py-2 font-bold">{idx + 1}</td>
                      <td className="border px-4 py-2 font-bold">{item.key}</td>
                      <td className="border px-4 py-2 font-bold">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold bg-gray-100 border-t">
                    <td
                      className="border px-4 py-2 text-center font-bold"
                      colSpan={2}
                    >
                      Total
                    </td>
                    <td className="border px-4 py-2 font-bold">{totalCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-2 mt-2 print:hidden">
              <button
                onClick={() => exportToPDF(title, data)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 font-bold rounded cursor-pointer"
              >
                <FileDown className="mr-2 inline" size={16} />
                Export to PDF
              </button>
              <button
                onClick={() => exportToExcel(title, data)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 font-bold rounded cursor-pointer"
              >
                <FileSpreadsheet className="mr-2 inline" size={16} />
                Export to Excel
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <Link href="/register">
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition cursor-pointer">
          Register
        </button>
      </Link>
      <h2 className="text-xl font-bold text-center print:text-left ">
        <Users className="mr-1 inline" size={20} /> Admissions Enrolled as on{" "}
        {currentDate}
      </h2>
      {renderTable("Date-Wise Enrollment", dateWiseCounts)}
      {renderTable("Group-Wise Enrollment", groupCounts)}
      {renderTable("Caste-Wise Enrollment", casteCounts)}
      {renderTable("Gender-Wise Enrollment", genderCounts)}
      {renderTable("Year-Wise Enrollment", admissionYearCounts)}

      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 font-bold rounded print:hidden cursor-pointer"
        >
          <Printer className="mr-2 inline" size={16} />
          Print All Tables
        </button>
      </div>

      {/* <AdmissionCharts />
      <GenderWiseChart />
      <CasteWiseChart /> */}
    </div>
  );
}
