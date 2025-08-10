//app/student-table/page.js
"use client";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";
import ReactPaginate from "react-paginate";
// StudentTable కంపోనెంట్ లో టాప్ లో ఇలా ఇంపోర్ట్ చేయండి
import StudentEditForm from "../student-edit-form/page"; // సరైన పాత్ ను ఉపయోగించండి
import Image from "next/image";
import generateAdmissionCertificatePDF from "../admission-certificate/page";
import generateStudyCertificatePDF from "../study-certificate/page";
import generateCaretakerCertificatePDF from "../caretaker-form/page";
import { useSession } from "next-auth/react";

import {
  FileDown,
  FileSpreadsheet,
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
    yearOfStudy: "",
  });
 const { data: session,status} = useSession();
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
      console.log("Fetched students:", result.data);
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

    if (filters.group) {
      filtered = filtered.filter((s) => s.group === filters.group);
    }
    if (filters.caste) {
      filtered = filtered.filter((s) => s.caste === filters.caste);
    }
    if (filters.gender) {
      filtered = filtered.filter((s) => s.gender === filters.gender);
    }
    if (filters.yearOfStudy) {
      filtered = filtered.filter(
        (s) => String(s.yearOfStudy) === String(filters.yearOfStudy)
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(0);
  }, [search, filters, students]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };



  const handleExportPDF = () => {

  
  const collegeName = session?.user?.collegeName || "College Name";

    const doc = new jsPDF();


  // ✅ College Name centered at top
  doc.setFontSize(14);
  doc.text(collegeName.toUpperCase(), 105, 15, { align: "center" });



    autoTable(doc, {
      startY: 25,
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
          "Year of Study",
          "Admission Number",
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
        s.yearOfStudy === "First Year" ? "First Year" : "Second Year",
        s.admissionNo,
        s.admissionYear,
        s.address,
      ]),
    });
    doc.save("students.pdf");
  };




const handleExportExcel = () => {
  const { user } = session || {};
  const collegeName = user?.collegeName || "College Name";

  // Prepare student data rows
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    AdmissionNo: s.admissionNo,
    AdmissionYear: s.admissionYear,
    Address: s.address,
  }));

  // ✅ Insert college name in first row as a dummy object
  const collegeHeaderRow = { SNo: "", Name: `College: ${collegeName}` };
  studentData.unshift(collegeHeaderRow); // Insert at beginning

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

printWindow.document.write(
    `<h2 style="text-align:center;">${collegeName.toUpperCase()}</h2>`
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
    const confirmDelete = confirm(
      "Are you sure you want to delete this student?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

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

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "osra-preset"); // Cloudinary upload preset
    formData.append("cloud_name", "dlwxpzc83"); // Cloudinary cloud name

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlwxpzc83/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await res.json();
    return data.secure_url;
  };

  // ఎడిట్ ఫంక్షన్ మెరుగుపరచబడింది
  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  // అప్డేట్ ఫంక్షన్
  const handleUpdate = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    setEditingStudent(null);
    toast.success("Student updated successfully");
  };

  // Calculate paginated students
  const offset = currentPage * studentsPerPage;
  const paginatedStudents = (filteredStudents || []).slice(
    offset,
    offset + studentsPerPage
  );
  const pageCount = Math.ceil((filteredStudents ? filteredStudents.length : 0) / studentsPerPage);

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center text-green-500  ">
<div className="flex justify-center mb-6">
  <input
    type="text"
    value={
      status === "loading"
        ? "Loading..."
        : session?.user?.collegeName || "College name missing"
    }
    disabled
    className="text-center font-semibold text-gray-900 p-2 border rounded bg-gray-100 w-[80%] md:w-[60%]"
  />
</div>

      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍&nbsp;Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded font-bold"
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
      <div className="flex gap-4 mb-4 flex-wrap">
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
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer font-bold">
            🏠&nbsp;Home
          </button>
        </Link>

        <Link href="/dashboard/first-year">
          <button className="bg-lime-800 text-white px-4 py-2 rounded hover:bg-cyan-700 transition cursor-pointer font-bold">
            🖥️&nbsp; First Year Dashboard
          </button>
        </Link>

        <Link href="/dashboard/second-year">
          <button className="bg-lime-800 text-white px-4 py-2 rounded hover:bg-cyan-700 transition cursor-pointer font-bold">
            🖥️&nbsp; Second Year Dashboard
          </button>
        </Link>

        <Link href="/attendance-records">
          <button className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition cursor-pointer font-bold">
            🧾&nbsp;Attendance Records
          </button>
        </Link>

        <Link href="/exam-report">
          <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            📝&nbsp; Exam Report
          </button>
        </Link>

        <Link href="/exams-form">
          <button className="w-full bg-amber-900 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            📝&nbsp;Marks Entry Form
          </button>
        </Link>

        <Link href="/attendance-form">
          <button className="w-full bg-cyan-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            📝&nbsp; Attendance Form
          </button>
        </Link>




        
        <Link href="/register">
        <button className="w-50 bg-cyan-600  text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
          📝&nbsp; Admission Form
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
              <th className="px-4 py-2">Year of study</th>
              <th className="px-4 py-2">Admission Year</th>
              <th className="px-4 py-2">Admission Date</th>
              <th className="px-4 py-2">Admission No</th>

              <th className="px-4 py-2">Address</th>
              <th className="px-3 py-2 border">Photo</th>
              <th className="px-4 py-2">Admission Certificate</th>
              <th className="px-4 py-2">Study Certificate</th>
              <th className="px-4 py-2">Care taker Form</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((s, idx) => (
              <tr key={s._id} className="border-t">
                <td className="px-4 py-2">{offset + idx + 1}</td>
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.fatherName}</td>
                <td className="px-4 py-2">{s.mobile}</td>
                <td className="px-4 py-2">{s.group}</td>
                <td className="px-4 py-2">{s.caste}</td>
                <td className="px-4 py-2">{s.gender}</td>
                <td className="px-4 py-2">
                  {new Date(s.dob).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {s.yearOfStudy === "First Year"
                    ? "First Year"
                    : "Second Year"}
                </td>
                <td className="px-4 py-2">{s.admissionYear}</td>
                <td className="px-4 py-2">
                  {new Date(s.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>

                <td className="px-4 py-2">{s.admissionNo}</td>
                <td className="px-4 py-2">{s.address}</td>

                <td className="px-3 py-2 border text-center">
                  {s.photo ? (
                    <Image
                      src={s.photo}
                      alt={s.name || "Student Photo"}
                      width={50}
                      height={50}
                      className="rounded-md border"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Photo</span>
                  )}
                </td>

                <td className="px-4 py-2">
                  <button
                    onClick={() => generateAdmissionCertificatePDF(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs cursor-pointer font-semibold"
                  >
                    Download
                  </button>
                </td>

                <td className="px-4 py-2">
                  <button
                    onClick={() => generateStudyCertificatePDF(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs cursor-pointer font-semibold"
                  >
                    Download
                  </button>
                </td>

                <td className="px-4 py-2">
                  <button
                    onClick={() => generateCaretakerCertificatePDF(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs cursor-pointer font-semibold"
                  >
                    Download
                  </button>
                </td>

                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50"
                    aria-label="Edit student"
                  >
                    <Pencil size={20} />
                  </button>

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

        <div className="mt-4 text-center text-gray-600 font-bold">
          Page {currentPage + 1} of {pageCount} | Showing{" "}
          {(filteredStudents ? filteredStudents.length : 0)} Students
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