"use client";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    group: "",
    caste: "",
    gender: "",
    admissionYear: "",
  });

  const tableRef = useRef();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        const result = await res.json();
        setStudents(result.data);
        setFilteredStudents(result.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = Array.isArray(students) ? students : [];

    if (search) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filters.group)
      filtered = filtered.filter((s) => s.group === filters.group);

    if (filters.caste)
      filtered = filtered.filter((s) => s.caste === filters.caste);

    if (filters.gender)
      filtered = filtered.filter((s) => s.gender === filters.gender);

    if (filters.admissionYear)
      filtered = filtered.filter(
        (s) => String(s.admissionYear) === String(filters.admissionYear)
      );

    setFilteredStudents(filtered);
  }, [search, filters, students]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("S.K.R.GOVERNMENT JUNIOR COLLEGE", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "S.No",
          "Name",
          "Mobile",
          "Group",
          "Caste",
          "Gender",
          "DOB",
          "Admission Year",
          "Address",
        ],
      ],
      body: filteredStudents.map((s, idx) => [
        idx + 1,
        s.name,
        s.mobile,
        s.group,
        s.caste,
        s.gender,
        s.dob,
        s.admissionYear,
        s.address,
      ]),
    });
    doc.save("students.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredStudents.map((s, idx) => ({
        SNo: idx + 1,
        Name: s.name,
        Mobile: s.mobile,
        Group: s.group,
        Caste: s.caste,
        Gender: s.gender,
        DOB: s.dob,
        AdmissionYear: s.admissionYear,
        Address: s.address,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students.xlsx");
  };

  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write("<html><head><title>Print Students</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
      th { background-color: #f2f2f2; }
      body { font-family: sans-serif; margin: 20px; }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(
      `<h2 style="text-align:center;">S.K.R. GOVERNMENT JUNIOR COLLEGE</h2>`
    );
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">S.K.R.GOVERNMENT JUNIOR COLLEGE</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          name="group"
          onChange={handleFilterChange}
          value={filters.group}
          className="border p-2 rounded"
        >
          <option value="">All Groups</option>
          <option value="MPC">MPC</option>
          <option value="BiPC">BiPC</option>
          <option value="CEC">CEC</option>
          <option value="HEC">HEC</option>
          <option value="M&AT">M&AT</option>
          <option value="MLT">MLT</option>
          <option value="CET">CET</option>
        </select>

        <select
          name="caste"
          onChange={handleFilterChange}
          value={filters.caste}
          className="border p-2 rounded"
        >
          <option value="">All Castes</option>
          <option value="OC">OC</option>
          <option value="BC-A">BC-A</option>
          <option value="BC-B">BC-B</option>
          <option value="BC-C">BC-C</option>
          <option value="BC-D">BC-D</option>
          <option value="BC-E">BC-E</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
        </select>

        <select
          name="gender"
          onChange={handleFilterChange}
          value={filters.gender}
          className="border p-2 rounded"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="number"
          name="admissionYear"
          placeholder="Admission Year"
          value={filters.admissionYear}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
      </div>

      {/* Export & Print Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleExportPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Export to PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Export to Excel
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Print
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="min-w-full table-auto border rounded shadow">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Group</th>
              <th className="px-4 py-2">Caste</th>
              <th className="px-4 py-2">Gender</th>
              <th className="px-4 py-2">DOB</th>
              <th className="px-4 py-2">Admission Year</th>
              <th className="px-4 py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredStudents) &&
              filteredStudents.map((s, idx) => (
                <tr key={s._id} className="border-t">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.mobile}</td>
                  <td className="px-4 py-2">{s.group}</td>
                  <td className="px-4 py-2">{s.caste}</td>
                  <td className="px-4 py-2">{s.gender}</td>
                  <td className="px-4 py-2">{s.dob}</td>
                  <td className="px-4 py-2">{s.admissionYear}</td>
                  <td className="px-4 py-2">{s.address}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
