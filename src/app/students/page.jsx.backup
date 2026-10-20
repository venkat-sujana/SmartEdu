"use client";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
  FileSignature,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

// ─── Student Card (mobile view) ───────────────────────────────────────────────
function StudentCard({ s, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-3 overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-blue-50 to-green-50">
        {s.photo ? (
          <Image
            src={s.photo}
            alt={s.name || "Student Photo"}
            width={44}
            height={44}
            className="rounded-full border-2 border-white object-cover shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
            {s.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{s.name}</p>
          <p className="text-xs text-gray-500">{s.group} • {s.yearOfStudy}</p>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
          #{idx}
        </span>
      </div>

      {/* Quick Info Row */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-4 py-3 text-sm">
        <div>
          <span className="text-gray-400 text-xs">Mobile</span>
          <p className="font-semibold text-gray-800">{s.mobile || "—"}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Caste</span>
          <p className="font-semibold text-gray-800">{s.caste || "—"}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Gender</span>
          <p className="font-semibold text-gray-800">{s.gender || "—"}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Adm. Year</span>
          <p className="font-semibold text-gray-800">{s.admissionYear || "—"}</p>
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm border-t border-gray-100 pt-3">
          <div>
            <span className="text-gray-400 text-xs">DOB</span>
            <p className="font-semibold text-gray-800">{s.dob || "—"}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Date of Joining</span>
            <p className="font-semibold text-gray-800">{s.dateOfJoining || "—"}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Adm. No</span>
            <p className="font-semibold text-gray-800">{s.admissionNo || "—"}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400 text-xs">Address</span>
            <p className="font-semibold text-gray-800">{s.address || "—"}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pb-3 pt-2 border-t border-gray-100">
        {/* Certificates Row */}
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => generateAdmissionCertificatePDF(s)}
            className="flex-1 min-w-[90px] bg-blue-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-700"
          >
            <FileSignature className="w-3.5 h-3.5" /> Admission
          </button>
          <button
            onClick={() => generateStudyCertificatePDF(s)}
            className="flex-1 min-w-[90px] bg-blue-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-700"
          >
            <FileSignature className="w-3.5 h-3.5" /> Study
          </button>
          <button
            onClick={() => generateCaretakerCertificatePDF(s)}
            className="flex-1 min-w-[90px] bg-blue-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-700"
          >
            <FileSignature className="w-3.5 h-3.5" /> Caretaker
          </button>
        </div>

        {/* Edit / Delete / Expand Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(s)}
            className="flex-1 flex items-center justify-center gap-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-100"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            onClick={() => onDelete(s._id)}
            className="flex-1 flex items-center justify-center gap-1.5 text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-100"
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
            aria-label={expanded ? "Show less" : "Show more"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filters, setFilters] = useState({
    group: "",
    caste: "",
    gender: "",
    yearOfStudy: "",
  });
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(true);
        const res = await fetch(`/api/students?collegeId=${session.user.collegeId}`);
        const result = await res.json();
        setStudents(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (status !== "loading") fetchStudents();
  }, [session?.user?.collegeId, status]);

  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (deferredSearch) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(deferredSearch.toLowerCase())
      );
    }
    if (filters.group) filtered = filtered.filter((s) => s.group === filters.group);
    if (filters.caste) filtered = filtered.filter((s) => s.caste === filters.caste);
    if (filters.gender) filtered = filtered.filter((s) => s.gender === filters.gender);
    if (filters.yearOfStudy)
      filtered = filtered.filter(
        (s) => String(s.yearOfStudy) === String(filters.yearOfStudy)
      );
    return filtered;
  }, [students, deferredSearch, filters]);

  useEffect(() => {
    setCurrentPage(0);
  }, [deferredSearch, filters, students]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(collegeName.toUpperCase(), 105, 15, { align: "center" });
    autoTable(doc, {
      startY: 25,
      head: [
        [
          "S.No","Name","Father Name","Mobile","Caste","Group",
          "Gender","Year of Study","Admission Year","Date Of Joining","Address",
        ],
      ],
      body: filteredStudents.map((s, idx) => [
        idx + 1,
        s.name,
        s.fatherName,
        s.mobile,
        s.caste,
        s.group,
        s.gender,
        s.yearOfStudy === "First Year" ? "First Year" : "Second Year",
        s.admissionYear,
        s.dateOfJoining,
        s.address,
      ]),
    });
    doc.save("students.pdf");
  };

  const handleExportExcel = () => {
    const { user } = session || {};
    const cName = user?.collegeName || "College Name";
    const studentData = filteredStudents.map((s, idx) => ({
      SNo: idx + 1,
      Name: s.name,
      FatherName: s.fatherName,
      Mobile: s.mobile,
      ParentMobile: s.parentMobile,
      Group: s.group,
      Caste: s.caste,
      Gender: s.gender,
      YearOfStudy: s.yearOfStudy,
      AdmissionDate: new Date(s.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      }),
      AdmissionYear: s.admissionYear,
      DateOfJoining: s.dateOfJoining,
      Address: s.address,
    }));
    studentData.unshift({ SNo: "", Name: `College: ${cName}` });
    const worksheet = XLSX.utils.json_to_sheet(studentData, { skipHeader: false });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students.xlsx");
  };

  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const { user } = session || {};
    const cName = user?.collegeName || "College Name";
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
    printWindow.document.write(`<h2 style="text-align:center;">${cName.toUpperCase()}</h2>`);
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handlePageChange = useCallback(({ selected }) => {
    setCurrentPage(selected);
  }, []);

  const handleDelete = useCallback(async (id) => {
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
  }, []);

  const handleEdit = useCallback((student) => setEditingStudent(student), []);
  const handleUpdate = useCallback((updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    setEditingStudent(null);
    toast.success("Student updated successfully");
  }, []);

  const offset = currentPage * studentsPerPage;
  const paginatedStudents = useMemo(
    () => filteredStudents.slice(offset, offset + studentsPerPage),
    [filteredStudents, offset]
  );
  const pageCount = useMemo(
    () => Math.ceil(filteredStudents.length / studentsPerPage),
    [filteredStudents.length]
  );

  // ── Loading skeleton rows ──
  const skeletonRows = Array.from({ length: studentsPerPage }).map((_, idx) => (
    <tr key={`loading-${idx}`} className="animate-pulse">
      <td colSpan={17} className="px-4 py-3">
        <div className="h-5 w-full rounded bg-gray-200" />
      </td>
    </tr>
  ));

  return (
    <div className="px-3 sm:px-4 md:px-6 max-w-screen-2xl mx-auto mt-24 pb-10">

      {/* ── College Header ── */}
      <div className="flex flex-col items-center mb-5">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3
          rounded-xl border-2 border-blue-200
          bg-linear-to-r from-blue-50 via-white to-green-50
          px-4 py-3 shadow-xl w-full sm:w-auto text-center">
          <School className="w-7 h-7 text-blue-600 shrink-0" />
          <span className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
            {collegeName}
          </span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        <input
          type="text"
          placeholder="🔍 Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="col-span-2 sm:col-span-1 border p-2 rounded font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          name="group"
          onChange={handleFilterChange}
          value={filters.group}
          className="border p-2 rounded font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
          className="border p-2 rounded font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
          className="border p-2 rounded font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
          className="border p-2 rounded font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Years</option>
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
        </select>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-5">
        <button
          onClick={handleExportPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 flex items-center gap-1.5 rounded font-bold cursor-pointer text-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden xs:inline">Export </span>PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 flex items-center gap-1.5 rounded font-bold cursor-pointer text-sm"
        >
          <FileDown className="w-4 h-4" />
          <span className="hidden xs:inline">Export </span>Excel
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 flex items-center gap-1.5 rounded font-bold cursor-pointer text-sm"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden xs:inline">Print </span>Table
        </button>
        <Link href="/lecturer/dashboard">
          <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700 flex items-center gap-1.5 cursor-pointer text-sm">
            <Users2 className="w-4 h-4" /> Dashboard
          </button>
        </Link>
      </div>

      {/* ── MOBILE: Card View (hidden on md+) ── */}
      <div className="block md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-36 mb-3" />
          ))
        ) : paginatedStudents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-semibold">
            No students found.
          </div>
        ) : (
          paginatedStudents.map((s, idx) => (
            <StudentCard
              key={s._id}
              s={s}
              idx={offset + idx + 1}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* ── DESKTOP: Table View (hidden on mobile) ── */}
      <div className="hidden md:block overflow-x-auto" ref={tableRef}>
        <table className="min-w-full table-auto border rounded-lg shadow-md font-semibold text-sm">
          <thead className="bg-gray-100 text-left text-gray-700 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 border-r border-gray-300 w-12 text-center">S.No</th>
              <th className="px-4 py-2 border-r border-gray-300 w-36">Name</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Mobile</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">DOB</th>
              <th className="px-4 py-2 border-r border-gray-300 w-24">Group</th>
              <th className="px-4 py-2 border-r border-gray-300 w-24">Caste</th>
              <th className="px-4 py-2 border-r border-gray-300 w-20">Gender</th>
              <th className="px-4 py-2 border-r border-gray-300 w-32">Year of Study</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Adm. Year</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Date of Joining</th>
              <th className="px-4 py-2 border-r border-gray-300 w-28">Adm. No</th>
              <th className="px-4 py-2 border-r border-gray-300">Address</th>
              <th className="px-3 py-2 border border-gray-300 w-16 text-center">Photo</th>
              <th className="px-4 py-2 border border-gray-300 w-28 text-center">Admission Cert.</th>
              <th className="px-4 py-2 border border-gray-300 w-28 text-center">Study Cert.</th>
              <th className="px-4 py-2 border border-gray-300 w-28 text-center">Caretaker Form</th>
              <th className="px-4 py-2 border border-gray-300 w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              skeletonRows
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={17} className="px-4 py-6 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((s, idx) => (
                <tr key={s._id} className="hover:bg-green-50 transition-colors">
                  <td className="px-4 py-2 border-r border-gray-300 text-center">{offset + idx + 1}</td>
                  <td className="px-4 py-2 border-r border-gray-300 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-2 border-r border-gray-300">{s.mobile}</td>
                  <td className="px-4 py-2 border-r border-gray-300">{s.dob}</td>
                  <td className="px-4 py-2 border-r border-gray-300">{s.group}</td>
                  <td className="px-4 py-2 border-r border-gray-300">{s.caste}</td>
                  <td className="px-4 py-2 border-r border-gray-300">{s.gender}</td>
                  <td className="px-4 py-2 border-r border-gray-300">
                    {s.yearOfStudy === "First Year" ? "First Year" : "Second Year"}
                  </td>
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
                        className="rounded-md border object-cover mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No Photo</span>
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
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex justify-center gap-2">
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Edit Modal ── */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6">
            <StudentEditForm
              student={editingStudent}
              onSave={handleUpdate}
              onCancel={() => setEditingStudent(null)}
            />
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="mt-6 flex justify-center">
        <ReactPaginate
          previousLabel={<span className="font-bold">&larr; Prev</span>}
          nextLabel={<span className="font-bold">Next &rarr;</span>}
          breakLabel={"..."}
          pageCount={Math.max(pageCount, 1)}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          containerClassName={"flex items-center flex-wrap justify-center gap-1"}
          pageClassName={"px-3 py-1 border rounded shadow-sm text-sm"}
          activeClassName={"bg-blue-500 text-white"}
          previousClassName={"px-3 py-1 border rounded font-bold bg-gray-50 text-sm"}
          nextClassName={"px-3 py-1 border rounded font-bold bg-gray-50 text-sm"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          forcePage={currentPage}
        />
      </div>
      <div className="mt-3 text-center text-gray-600 font-bold text-sm">
        Page {currentPage + 1} of {Math.max(pageCount, 1)} &nbsp;|&nbsp; {filteredStudents.length} Students
      </div>
    </div>
  );
}