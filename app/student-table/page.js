//app/student-table/page.js

"use client";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ReactPaginate from 'react-paginate';
import {
  Users,
  FileDown,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";

import Link from "next/link";

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

  const [currentPage, setCurrentPage] = useState(0);
  const studentsPerPage = 5;

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
    setCurrentPage(0); // Reset to first page when filters change
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
          "Father Name",
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
        s.fatherName,
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
        FatherName: s.fatherName,
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

  const pageCount = Math.ceil(filteredStudents.length / studentsPerPage);

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

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents(students.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleEdit = async (student) => {
    const updatedName = prompt("Enter new name:", student.name);
    const updatedFatherName = prompt("Enter new father's name:", student.fatherName);
    const updatedMobile = prompt("Enter new mobile:", student.mobile);
    const updatedGroup = prompt("Enter new group:", student.group);
    const updatedCaste = prompt("Enter new caste:", student.caste);
    const updatedGender = prompt("Enter new gender:", student.gender);
    const updatedAdmissionYear = prompt("Enter new admission year:", student.admissionYear);
    const updatedAddress = prompt("Enter new address:", student.address);

    if (updatedName && updatedMobile) {
      try {
        const res = await fetch(`/api/students/${student._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...student,
            name: updatedName,
            fatherName: updatedFatherName,
            mobile: updatedMobile,
            group: updatedGroup,
            caste: updatedCaste,
            gender: updatedGender,
            admissionYear: updatedAdmissionYear,
            address: updatedAddress,
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          setStudents(
            students.map((s) => (s._id === student._id ? updated.data : s))
          );
        }
      } catch (err) {
        console.error("Update Error:", err);
      }
    }
  };
// Get current students for pagination
  const offset = currentPage * studentsPerPage;
  const currentStudents = filteredStudents.slice(offset, offset + studentsPerPage);



  

  const generateCertificatePDF = (student) => {
    const doc = new jsPDF();
  
    // Title border box
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277); // outer border
  
    // College/School Name
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("S.K.R.GOVERNMENT JUNIOR COLLEGE-GUDUR ", 105, 30, { align: "center" });
  
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.text("THILAK NAGAR, GUDUR--524101", 105, 38, { align: "center" });
  
    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
  
    // Certificate Title
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("ADMISSION CERTIFICATE", 105, 60, { align: "center" });
  
    let y = 70;
    doc.setFontSize(12);
    doc.setFont("times", "normal");
  
    doc.text(`This is to certify that the following student has been admitted`, 20, y);
    y += 10;
    doc.text(`into the institution for the academic year ${student.admissionYear}-${student.admissionYear + 1}`, 20, y);
  
    y += 10;
    doc.setFont("times", "bold");
    doc.text("Student Details", 20, y);
  
    y += 5;
    doc.setFont("times", "normal");
    doc.text(`Name             : ${student.name}`, 30, y); y += 10;
    doc.text(`Father's Name    : ${student.fatherName}`, 30, y); y += 10;
    doc.text(`Date of Birth    : ${new Date(student.dob).toLocaleDateString('en-GB')}`, 30, y); y += 10;
    doc.text(`Gender           : ${student.gender}`, 30, y); y += 10;
    doc.text(`Caste            : ${student.caste}`, 30, y); y += 10;
    doc.text(`Group            : ${student.group}`, 30, y); y += 10;
    doc.text(`Mobile Number    : ${student.mobile}`, 30, y);
    y += 10;
    doc.text(`Date of Admission: ${new Date(student.createdAt).toLocaleDateString('en-GB')}`, 30, y);

  
    y += 10;
    doc.setFont("times", "italic");
    doc.text("This certificate is issued on request of the student for official purposes.", 20, y);
  
    // Signature
    y += 30;
    doc.setFont("times", "bold");
    doc.text("Signature", 160, y);
    doc.setFont("times", "normal");
    doc.text("(Principal/Head of Institution)", 130, y + 7);
  
    doc.save("admission-certificate.pdf");
  };
  

return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        S.K.R.GOVERNMENT JUNIOR COLLEGE
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6 ">
        <input 
          type="text "
          placeholder="Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded font-bold "
        />
        <select
          name="group"
          onChange={handleFilterChange}
          value={filters.group}
          className="border p-2 rounded font-bold"
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
          className="border p-2 rounded font-bold"
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
          className="border p-2 rounded font-bold"
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
          className="border p-2 rounded font-bold"
        />
      </div>

      {/* Export & Print Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleExportPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center cursor-pointer"
        >
          <FileSpreadsheet size={20} color="white" fontWeight={"bold"} />
          &nbsp;Export to PDF
        </button>

        <button
          onClick={handleExportExcel}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center cursor-pointer"
        >
          <FileDown size={20} color="white" fontWeight={"bold"} />
          &nbsp;Export to Excel
        </button>

        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center cursor-pointer"
        >
          <Printer size={20} color="white" fontWeight={"bold"} />
          &nbsp;Print
        </button>

        <Link href="/">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer fontweight-bold">
            Home
          </button>
        </Link>

        <Link href="/dashboard">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition cursor-pointer fontweight-bold">
            Dashboard
          </button>
        </Link>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="min-w-full table-auto border rounded shadow font-semibold">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Father Name</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Group</th>
              <th className="px-4 py-2">Caste</th>
              <th className="px-4 py-2">Gender</th>
              <th className="px-4 py-2">DOB</th>
              <th className="px-4 py-2">Admission Year</th>
              <th className="px-4 py-2">Admission Date</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">Admission Certificate</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((s, idx) => (
              <tr key={s._id} className="border-t">
                <td className="px-4 py-2">{offset + idx + 1}</td>
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.fatherName}</td>
                <td className="px-4 py-2">{s.mobile}</td>
                <td className="px-4 py-2">{s.group}</td>
                <td className="px-4 py-2">{s.caste}</td>
                <td className="px-4 py-2">{s.gender}</td>
                <td className="px-4 py-2">{new Date(s.dob).toLocaleDateString()}</td>
                <td className="px-4 py-2">{s.admissionYear}</td>
                <td className="px-4 py-2">
                {new Date(s.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })}
              </td>
                <td className="px-4 py-2">{s.address}</td>

                <td className="px-4 py-2">
                <button
                  onClick={() => generateCertificatePDF(s)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs cursor-pointer font-semibold"
                >
                  Certificate
                </button>
                  </td>
                
                
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                  >
                    <Pencil size={20} />
                  </button>&nbsp;
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-center text-gray-600 font-bold">
          Page {currentPage + 1} of {pageCount} | Showing{" "}
        Total:{filteredStudents.length} Students
        </div>
        {pageCount > 1 && (
          <div className="mt-4 flex justify-center cursor-pointer font-bold">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageChange}
              containerClassName={"flex items-center space-x-2"}
              pageClassName={"px-3 py-1 border rounded"}
              pageLinkClassName={"text-black-600"}
              activeClassName={"bg-blue-500 text-white"}
              previousClassName={"px-3 py-1 border rounded"}
              nextClassName={"px-3 py-1 border rounded"}
              disabledClassName={"opacity-50 cursor-not-allowed"}
              forcePage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}