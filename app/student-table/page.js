//app/student-table/page.js
"use client";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import autoTable from "jspdf-autotable";
import ReactPaginate from "react-paginate";
import StudentEditForm from "../student-edit-form/page";
import Image from "next/image";
import generateAdmissionCertificatePDF from "../admission-certificate/page";
import generateStudyCertificatePDF from "../study-certificate/page";
import generateCaretakerCertificatePDF from "../caretaker-form/page";
import { useSession } from "next-auth/react";
import {
  School,
  Users2,
  FileSpreadsheet,
  FileDown,
  Printer,
  Pencil,
  Trash2,
  FileSignature
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
    yearOfStudy: "",
  });
  const { data: session, status } = useSession();
  const collegeName =
    status === "loading"
      ? "Loading..."
      : session?.user?.collegeName || "College name missing";

  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const studentsPerPage = 10;
  const tableRef = useRef();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!session?.user?.collegeId) return;
        const res = await fetch(`/api/students?collegeId=${session.user.collegeId}`);
        const result = await res.json();
        setStudents(Array.isArray(result.data) ? result.data : []);
        setFilteredStudents(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, [session]);

  useEffect(() => {
    let filtered = [...students];
    if (search) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filters.group) filtered = filtered.filter((s) => s.group === filters.group);
    if (filters.caste) filtered = filtered.filter((s) => s.caste === filters.caste);
    if (filters.gender) filtered = filtered.filter((s) => s.gender === filters.gender);
    if (filters.yearOfStudy) filtered = filtered.filter(
      (s) => String(s.yearOfStudy) === String(filters.yearOfStudy)
    );
    setFilteredStudents(filtered);
    setCurrentPage(0);
  }, [search, filters, students]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(collegeName.toUpperCase(), 105, 15, { align: "center" });
    autoTable(doc, {
      startY: 25,
      head: [
        [
          "S.No", "Name", "Father Name", "Mobile", "Group", "Caste", "Gender", "DOB",
          "Year of Study", "Admission Number", "Admission Year", "Date Of Joining", "Address"
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
        s.yearOfStudy === "First Year" ? "First Year" : "Second Year",
        s.admissionNo,
        s.admissionYear,
        s.dateOfJoining,
        s.address
      ]),
    });
    doc.save("students.pdf");
  };

  const handleExportExcel = () => {
    const { user } = session || {};
    const collegeName = user?.collegeName || "College Name";
    const studentData = filteredStudents.map((s, idx) => ({
      SNo: idx + 1,
      Name: s.name,
      FatherName: s.fatherName,
      Mobile: s.mobile,
      Group: s.group,
      Caste: s.caste,
      Gender: s.gender,
      DOB: s.dob,
      YearOfStudy: s.yearOfStudy,
      AdmissionDate: new Date(s.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      }),
      AdmissionNo: s.admissionNo,
      AdmissionYear: s.admissionYear,
      dateOfJoining: s.dateOfJoining,
      Address: s.address,
    }));
    const collegeHeaderRow = { SNo: "", Name: `College: ${collegeName}` };
    studentData.unshift(collegeHeaderRow);
    const worksheet = XLSX.utils.json_to_sheet(studentData, { skipHeader: false });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students.xlsx");
  };

  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const { user } = session || {};
    const collegeName = user?.collegeName || "College Name";
    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write("<html><head><title>Print Students</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
      th { background-color: #f2f2f2; }
      body { font-family: sans-serif; margin: 20px; }
      img { max-width: 50px; height: auto; }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(`<h2 style="text-align:center;">${collegeName.toUpperCase()}</h2>`);
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s._id !== id));
        toast.success("Student deleted successfully 🗑️");
      } else {
        toast.error("Error deleting student: " + result.message);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Something went wrong while deleting.");
    }
  };

  const handleEdit = (student) => setEditingStudent(student);
  const handleUpdate = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    setEditingStudent(null);
    toast.success("Student updated successfully");
  };

  const offset = currentPage * studentsPerPage;
  const paginatedStudents = (filteredStudents || []).slice(
    offset,
    offset + studentsPerPage
  );
  const pageCount = Math.ceil((filteredStudents ? filteredStudents.length : 0) / studentsPerPage);

  return (
    <div className="p-6 max-w-8xl mx-auto mt-24">
      {/* College Header with Icon */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-green-50 px-6 py-3 font-extrabold text-blue-900 text-xl shadow-xl">
          <School className="w-8 h-8 text-indigo-700" />
          <span className="tracking-wider">{collegeName}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded font-bold"
        />
        <select name="group" onChange={handleFilterChange} value={filters.group} className="border p-2 rounded font-bold">
          <option value="">All Groups</option>
          <option value="MPC">MPC</option>
          <option value="BiPC">BiPC</option>
          <option value="CEC">CEC</option>
          <option value="HEC">HEC</option>
          <option value="M&AT">M&AT</option>
          <option value="MLT">MLT</option>
          <option value="CET">CET</option>
        </select>
        <select name="caste" onChange={handleFilterChange} value={filters.caste} className="border p-2 rounded font-bold">
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
        <select name="gender" onChange={handleFilterChange} value={filters.gender} className="border p-2 rounded font-bold">
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select
          name="yearOfStudy"
          onChange={handleFilterChange}
          value={filters.yearOfStudy}
          className="border p-2 rounded font-bold"
        >
          <option value="">Study of Years</option>
          <option value="First Year">First year</option>
          <option value="Second Year">Second year</option>
        </select>
      </div>

      {/* Export & Print Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleExportPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center rounded font-bold cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5 mr-2" /> Export PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex items-center rounded font-bold cursor-pointer"
        >
          <FileDown className="w-5 h-5 mr-2" /> Export Excel
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex items-center rounded font-bold cursor-pointer"
        >
          <Printer className="w-5 h-5 mr-2" /> Print Table
        </button>
        <Link href="/lecturer/dashboard">
          <button className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 flex items-center gap-2 cursor-pointer">
            <Users2 className="w-5 h-5" /> Dashboard
          </button>
        </Link>
        {/* ...other nav as before (Attendance Records, Exam Report, etc, with icons if desired) */}
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="min-w-full table-auto border rounded-lg shadow-md font-semibold text-sm">
          <thead className="bg-gray-100 text-left text-gray-700 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 border-r border-gray-300 w-12 text-center">S.No</th>
              <th className="px-4 py-2 border-r border-gray-300 w-36">Name</th>
              <th className="px-4 py-2 border-r border-gray-300 w-36">Father Name</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Mobile</th>
              <th className="px-4 py-2 border-r border-gray-300 w-24">Group</th>
              <th className="px-4 py-2 border-r border-gray-300 w-24">Caste</th>
              <th className="px-4 py-2 border-r border-gray-300 w-20">Gender</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">DOB</th>
              <th className="px-4 py-2 border-r border-gray-300 w-32">Year of Study</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Admission Year</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Date of Joining</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Admission No</th>
              <th className="px-4 py-2 border-r border-gray-300">Address</th>
              <th className="px-3 py-2 border border-gray-300 w-16 text-center">Photo</th>
              <th className="px-4 py-2 border border-gray-300 w-28 text-center">Admission Certificate</th>
              <th className="px-4 py-2 border border-gray-300 w-28 text-center">Study Certificate</th>
              <th className="px-4 py-2 border border-gray-300 w-28 text-center">Care taker Form</th>
              <th className="px-4 py-2 border border-gray-300 w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedStudents.map((s, idx) => (
              <tr key={s._id} className="hover:bg-green-50 transition-colors">
                <td className="px-4 py-2 border-r border-gray-300 text-center">{offset + idx + 1}</td>
                <td className="px-4 py-2 border-r border-gray-300 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.fatherName}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.mobile}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.group}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.caste}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.gender}</td>
                <td className="px-4 py-2 border-r border-gray-300">{new Date(s.dob).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.yearOfStudy === "First Year" ? "First Year" : "Second Year"}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.admissionYear}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.dateOfJoining}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.admissionNo}</td>
                <td className="px-4 py-2 border-r border-gray-300">{s.address}</td>
                <td className="px-3 py-2 border border-gray-300 text-center">
                  {s.photo ? (
                    <Image
                      src={s.photo}
                      alt={s.name || "Student Photo"}
                      width={50}
                      height={50}
                      className="rounded-md border object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Photo</span>
                  )}
                </td>
                <td className="px-4 py-2 border border-gray-300 text-center">
                  <button
                    onClick={() => generateAdmissionCertificatePDF(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" /> Admission
                  </button>
                </td>
                <td className="px-4 py-2 border border-gray-300 text-center">
                  <button
                    onClick={() => generateStudyCertificatePDF(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" /> Study
                  </button>
                </td>
                <td className="px-4 py-2 border border-gray-300 text-center">
                  <button
                    onClick={() => generateCaretakerCertificatePDF(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" /> Caretaker
                  </button>
                </td>
                <td className="px-4 py-2 border border-gray-300 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50"
                    aria-label="Edit student"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer p-1 rounded hover:bg-red-50"
                    aria-label="Delete student"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Edit Modal */}
        {editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <StudentEditForm
                student={editingStudent}
                onSave={handleUpdate}
                onCancel={() => setEditingStudent(null)}
              />
            </div>
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center">
        <ReactPaginate
          previousLabel={<span className="font-bold">&larr; Previous</span>}
          nextLabel={<span className="font-bold">Next &rarr;</span>}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={"flex items-center space-x-2"}
          pageClassName={"px-3 py-1 border rounded shadow-sm"}
          activeClassName={"bg-blue-500 text-white"}
          previousClassName={"px-3 py-1 border rounded font-bold bg-gray-50"}
          nextClassName={"px-3 py-1 border rounded font-bold bg-gray-50"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          forcePage={currentPage}
        />
      </div>
      <div className="mt-4 text-center text-gray-600 font-bold">
        Page {currentPage + 1} of {pageCount} | Showing {filteredStudents.length} Students
      </div>
    </div>
  );
}
