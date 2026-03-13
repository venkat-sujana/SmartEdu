"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const studentsPerPage = 10;

const casteOptions = ["OC", "OBC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];
const genderOptions = ["Male", "Female", "Other"];
const yearOptions = ["First Year", "Second Year"];

export default function GroupStudentTable({ groupName }) {
  const { data: session, status } = useSession();
  const collegeName =
    status === "loading" ? "Loading..." : session?.user?.collegeName || "College";

  const theme = getGroupTheme(groupName);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    caste: "",
    gender: "",
    yearOfStudy: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const tableRef = useRef(null);

  useEffect(() => {
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

        setStudents(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Student table fetch error:", error);
        toast.error(`${groupName} students load కాలేదు`);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupStudents();
  }, [groupName, session, status]);

  const filteredStudents = useMemo(() => {
    let nextStudents = [...students];
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      nextStudents = nextStudents.filter(student =>
        student.name?.toLowerCase().includes(normalizedSearch) ||
        student.fatherName?.toLowerCase().includes(normalizedSearch) ||
        student.admissionNo?.toLowerCase().includes(normalizedSearch)
      );
    }

    if (filters.caste) {
      nextStudents = nextStudents.filter(student => student.caste === filters.caste);
    }

    if (filters.gender) {
      nextStudents = nextStudents.filter(student => student.gender === filters.gender);
    }

    if (filters.yearOfStudy) {
      nextStudents = nextStudents.filter(
        student => student.yearOfStudy === filters.yearOfStudy
      );
    }

    return nextStudents;
  }, [filters, search, students]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, filters]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const offset = currentPage * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(offset, offset + studentsPerPage);

  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilters({ caste: "", gender: "", yearOfStudy: "" });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(`${collegeName} - ${groupName} Students`, 148, 14, { align: "center" });
    autoTable(doc, {
      startY: 22,
      head: [["S.No", "Name", "Father Name", "Mobile", "Caste", "Gender", "Year", "Admission No"]],
      body: filteredStudents.map((student, index) => [
        index + 1,
        student.name,
        student.fatherName,
        student.mobile,
        student.caste,
        student.gender,
        student.yearOfStudy,
        student.admissionNo,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    });
    doc.save(`${groupName}_students.pdf`);
  };

  const handleExportExcel = () => {
    const rows = filteredStudents.map((student, index) => ({
      SNo: index + 1,
      Name: student.name,
      FatherName: student.fatherName,
      Mobile: student.mobile,
      Group: student.group,
      Caste: student.caste,
      Gender: student.gender,
      Year: student.yearOfStudy,
      AdmissionNo: student.admissionNo,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${groupName}_Students`);
    XLSX.writeFile(workbook, `${groupName}_students.xlsx`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow || !tableRef.current) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${groupName} Students</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
            h2 { text-align: center; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #0f172a; color: white; }
          </style>
        </head>
        <body>
          <h2>${collegeName} - ${groupName} Students</h2>
          ${tableRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDelete = async id => {
    if (!window.confirm(`Delete ${groupName} student?`)) return;

    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setStudents(prev => prev.filter(student => student._id !== id));
      toast.success("Student deleted");
    } catch (error) {
      console.error("Student delete error:", error);
      toast.error("Delete failed");
    }
  };

  const handleUpdate = async updatedStudent => {
    try {
      const response = await fetch(`/api/students/${updatedStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      setStudents(prev =>
        prev.map(student =>
          student._id === updatedStudent._id ? updatedStudent : student
        )
      );
      setEditingStudent(null);
      toast.success("Student updated");
    } catch (error) {
      console.error("Student update error:", error);
      toast.error("Update failed");
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <div className={`overflow-hidden rounded-3xl border ${theme.softBorder} bg-white shadow-sm`}>
        <div className={`bg-linear-to-r ${theme.header} px-5 py-5 text-white`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                <Users2 className="h-4 w-4" />
                Student Register
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{groupName} Students</h2>
                <p className="text-sm text-slate-200">{collegeName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-200">Total</p>
                <p className="mt-1 text-xl font-bold">{students.length}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-200">Visible</p>
                <p className="mt-1 text-xl font-bold">{filteredStudents.length}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 col-span-2 sm:col-span-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-200">Page</p>
                <p className="mt-1 text-xl font-bold">
                  {Math.min(currentPage + 1, pageCount)} / {pageCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`space-y-4 bg-linear-to-br ${theme.soft} p-4 md:p-5`}>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.8fr))]">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search name, father name, admission no"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              name="caste"
              value={filters.caste}
              onChange={handleFilterChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
            >
              <option value="">All Castes</option>
              {casteOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
            >
              <option value="">All Genders</option>
              {genderOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              name="yearOfStudy"
              value={filters.yearOfStudy}
              onChange={handleFilterChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
            >
              <option value="">All Years</option>
              {yearOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>

            <button
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Clear Filters
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-16 text-center text-sm text-slate-500">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
              <p className="text-base font-semibold text-slate-700">No students found</p>
              <p className="mt-1 text-sm text-slate-500">
                Search or filter values మార్చి మళ్లీ చూడండి.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 lg:hidden">
                {paginatedStudents.map((student, index) => (
                  <article
                    key={student._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          #{offset + index + 1}
                        </p>
                        <h3 className="truncate text-base font-bold text-slate-900">
                          {student.name}
                        </h3>
                        <p className="truncate text-sm text-slate-500">
                          Father: {student.fatherName}
                        </p>
                      </div>
                      <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {student.photo ? (
                          <Image
                            src={student.photo}
                            alt={student.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                            N/A
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <InfoChip label="Admission" value={student.admissionNo} />
                      <InfoChip label="Mobile" value={student.mobile} />
                      <InfoChip label="Caste" value={student.caste} />
                      <InfoChip label="Gender" value={student.gender} />
                      <InfoChip label="Year" value={student.yearOfStudy} />
                      <InfoChip label="Group" value={student.group} />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="flex-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div
                ref={tableRef}
                className="hidden overflow-hidden rounded-2xl border border-slate-200 lg:block"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 bg-white">
                    <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      <tr>
                        <th className="px-4 py-3 text-center">No</th>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Father Name</th>
                        <th className="px-4 py-3">Mobile</th>
                        <th className="px-4 py-3">Caste</th>
                        <th className="px-4 py-3">Gender</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Admission No</th>
                        <th className="px-4 py-3 text-center">Photo</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {paginatedStudents.map((student, index) => (
                        <tr key={student._id} className="odd:bg-white even:bg-slate-50">
                          <td className="px-4 py-3 text-center font-semibold">
                            {offset + index + 1}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-3">{student.fatherName}</td>
                          <td className="px-4 py-3">{student.mobile}</td>
                          <td className="px-4 py-3">{student.caste}</td>
                          <td className="px-4 py-3">{student.gender}</td>
                          <td className="px-4 py-3">{student.yearOfStudy}</td>
                          <td className="px-4 py-3">{student.admissionNo}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                {student.photo ? (
                                  <Image
                                    src={student.photo}
                                    alt={student.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-400">
                                    N/A
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setEditingStudent(student)}
                                className="rounded-lg bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(student._id)}
                                className="rounded-lg bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredStudents.length === 0 ? 0 : offset + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(offset + studentsPerPage, filteredStudents.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {filteredStudents.length}
              </span>{" "}
              students
            </p>

            <ReactPaginate
              previousLabel="Prev"
              nextLabel="Next"
              breakLabel="..."
              pageCount={pageCount}
              onPageChange={({ selected }) => setCurrentPage(selected)}
              forcePage={Math.min(currentPage, pageCount - 1)}
              containerClassName="flex flex-wrap items-center gap-2"
              pageClassName="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              activeClassName="!border-blue-600 !bg-blue-600 !text-white"
              previousClassName="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              nextClassName="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              breakClassName="px-1 text-slate-400"
              disabledClassName="opacity-40"
            />
          </div>
        </div>
      </div>

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Edit Student
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {editingStudent.name || "Student"}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={editingStudent.name || ""}
                onChange={event =>
                  setEditingStudent(prev => ({ ...prev, name: event.target.value }))
                }
                placeholder="Name"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
              <input
                value={editingStudent.fatherName || ""}
                onChange={event =>
                  setEditingStudent(prev => ({
                    ...prev,
                    fatherName: event.target.value,
                  }))
                }
                placeholder="Father Name"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
              <input
                value={editingStudent.mobile || ""}
                onChange={event =>
                  setEditingStudent(prev => ({ ...prev, mobile: event.target.value }))
                }
                placeholder="Mobile"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none sm:col-span-2"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => handleUpdate(editingStudent)}
                className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingStudent(null)}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-slate-700">{value || "-"}</p>
    </div>
  );
}
