// src/components/tables/GroupStudentTable.optimized.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";
import toast from "react-hot-toast";
import { getGroupTheme } from "@/components/dashboard/groupTheme";
import {
  Download,
  FileSpreadsheet,
  Pencil,
  Printer,
  Search,
  Trash2,
  Users2,
} from "lucide-react";

// Constants
const STUDENTS_PER_PAGE = 10;
const CASTE_OPTIONS = ["OC", "OBC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const YEAR_OPTIONS = ["First Year", "Second Year"];
const STATUS_OPTIONS = ["Active", "Terminated"];

// Memoized components
const FilterSelect = memo(function FilterSelect({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
      >
        <option value="">All {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
});

const StudentRow = memo(function StudentRow({ student, index, onEdit, onDelete, theme }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-center text-sm text-slate-500">{index + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {student.photo ? (
            <Image
              src={student.photo}
              alt={student.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold">
              {student.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900">{student.name}</p>
            <p className="text-xs text-slate-500">{student.admissionNo}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{student.fatherName}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{student.mobile}</td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
          student.status === 'Active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {student.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{student.caste}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{student.gender}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{student.yearOfStudy}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(student)}
            className={`rounded-lg p-2 transition-colors ${theme.hover}`}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(student._id)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function GroupStudentTable({ groupName }) {
  const { data: session, status } = useSession();
  const collegeName = useMemo(() => 
    status === "loading" ? "Loading..." : session?.user?.collegeName || "College",
    [status, session?.user?.collegeName]
  );

  const theme = useMemo(() => getGroupTheme(groupName), [groupName]);
  
  // State management
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ caste: "", gender: "", yearOfStudy: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const tableRef = useRef(null);

  // Fetch students with proper cleanup
  useEffect(() => {
    let isMounted = true;
    
    const fetchGroupStudents = async () => {
      if (!session?.user?.collegeId || !groupName || status !== "authenticated") {
        return;
      }

      setIsLoading(true);
      try {
        const url = `/api/students?group=${encodeURIComponent(groupName)}`;
        const res = await fetch(url, { credentials: "include" });
        const result = await res.json();

        if (!res.ok || result.status !== "success") {
          throw new Error(result?.message || "Failed to load students");
        }

        if (isMounted) {
          setStudents(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Student table fetch error:", error);
        if (isMounted) {
          toast.error(`${groupName} students load failed`);
          setStudents([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGroupStudents();
    
    return () => { isMounted = false; };
  }, [groupName, session, status]);

  // Memoized filtering
  const filteredStudents = useMemo(() => {
    let nextStudents = students;
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      nextStudents = nextStudents.filter(student =>
        student.name?.toLowerCase().includes(normalizedSearch) ||
        student.fatherName?.toLowerCase().includes(normalizedSearch) ||
        student.admissionNo?.toLowerCase().includes(normalizedSearch)
      );
    }

    if (filters.caste) {
      nextStudents = nextStudents.filter(s => s.caste === filters.caste);
    }
    if (filters.gender) {
      nextStudents = nextStudents.filter(s => s.gender === filters.gender);
    }
    if (filters.yearOfStudy) {
      nextStudents = nextStudents.filter(s => s.yearOfStudy === filters.yearOfStudy);
    }

    return nextStudents;
  }, [filters, search, students]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [search, filters]);

  // Pagination
  const pagination = useMemo(() => {
    const pageCount = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));
    const offset = currentPage * STUDENTS_PER_PAGE;
    const paginatedStudents = filteredStudents.slice(offset, offset + STUDENTS_PER_PAGE);
    return { pageCount, paginatedStudents };
  }, [filteredStudents, currentPage]);

  // Event handlers with useCallback
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setFilters({ caste: "", gender: "", yearOfStudy: "" });
  }, []);

  const handlePageChange = useCallback(({ selected }) => {
    setCurrentPage(selected);
  }, []);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(`${collegeName} - ${groupName} Students`, 148, 14, { align: "center" });
    autoTable(doc, {
      startY: 22,
      head: [["S.No", "Name", "Father Name", "Mobile", "Caste", "Gender", "Year"]],
      body: filteredStudents.map((student, index) => [
        index + 1,
        student.name,
        student.fatherName,
        student.mobile,
        student.caste,
        student.gender,
        student.yearOfStudy,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    });
    doc.save(`${groupName}_students.pdf`);
  }, [collegeName, groupName, filteredStudents]);

  const handleExportExcel = useCallback(() => {
    const rows = filteredStudents.map((student, index) => ({
      SNo: index + 1,
      Name: student.name,
      FatherName: student.fatherName,
      Mobile: student.mobile,
      ParentMobile: student.parentMobile,
      Group: student.group,
      Caste: student.caste,
      Gender: student.gender,
      Year: student.yearOfStudy
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${groupName}_Students`);
    XLSX.writeFile(workbook, `${groupName}_students.xlsx`);
  }, [filteredStudents, groupName]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(`Delete ${groupName} student?`)) return;

    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Delete failed");
      }

      setStudents(prev => prev.filter(s => s._id !== id));
      toast.success(result?.message || "Student deleted");
    } catch (error) {
      console.error("Student delete error:", error);
      toast.error(error.message || "Delete failed");
    }
  }, [groupName]);

  const handleEdit = useCallback((student) => {
    setEditingStudent(student);
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-16">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <div className={`overflow-hidden rounded-3xl border ${theme.softBorder} bg-white shadow-sm`}>
        {/* Header */}
        <div className={`bg-linear-to-r ${theme.header} px-5 py-5 text-white`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                <Users2 className="h-4 w-4" />
                Student Register
              </div>
              <h2 className="text-xl font-black tracking-tight">{groupName} Students</h2>
              <p className="text-sm text-white/80">{collegeName}</p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border-0 bg-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <FilterSelect
              label="Caste"
              name="caste"
              value={filters.caste}
              onChange={handleFilterChange}
              options={CASTE_OPTIONS}
            />
            <FilterSelect
              label="Gender"
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              options={GENDER_OPTIONS}
            />
            <FilterSelect
              label="Year"
              name="yearOfStudy"
              value={filters.yearOfStudy}
              onChange={handleFilterChange}
              options={YEAR_OPTIONS}
            />
            <div className="flex items-end gap-2 lg:col-span-2">
              <button
                onClick={handleClearFilters}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 text-center">#</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Father Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Caste</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pagination.paginatedStudents.map((student, index) => (
                <StudentRow
                  key={student._id}
                  student={student}
                  index={currentPage * STUDENTS_PER_PAGE + index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  theme={theme}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {pagination.paginatedStudents.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-slate-500">No students found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="border-t border-slate-200 px-5 py-4">
            <ReactPaginate
              pageCount={pagination.pageCount}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              onPageChange={handlePageChange}
              forcePage={currentPage}
              containerClassName="flex items-center justify-center gap-1"
              pageClassName="inline-flex"
              pageLinkClassName="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              activeClassName="!bg-blue-600 !text-white rounded-lg"
              previousClassName="inline-flex"
              nextClassName="inline-flex"
              previousLinkClassName="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              nextLinkClassName="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        )}
      </div>
    </section>
  );
}
