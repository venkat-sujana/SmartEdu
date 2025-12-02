"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import autoTable from "jspdf-autotable";
import ReactPaginate from "react-paginate";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  School, Users2, FileSpreadsheet, FileDown, Printer, Pencil, Trash2
} from "lucide-react";

export default function GroupStudentTable({ groupName, collegeId }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ caste: "", gender: "", yearOfStudy: "" });
  const { data: session, status } = useSession();
  const collegeName = status === "loading" ? "Loading..." : session?.user?.collegeName || "College";
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const studentsPerPage = 10;
  const tableRef = useRef();

  // ✅ FIXED: Data fetch on mount
  useEffect(() => {
    const fetchGroupStudents = async () => {
      if (!session?.user?.collegeId || !groupName || status !== 'authenticated') return;
      
      try {
        const url = `/api/students?group=${encodeURIComponent(groupName)}`;
        const res = await fetch(url, { credentials: 'include' });
        const result = await res.json();
        
        if (result.status === 'success') {
          const groupStudents = Array.isArray(result.data) ? result.data : [];
          setStudents(groupStudents);
          setFilteredStudents(groupStudents);
        }
      } catch (err) {
        toast.error(`${groupName} డాటా లోడ్ అవ్వలేదు`);
      }
    };
    fetchGroupStudents();
  }, [groupName, session, status]);

  // ✅ FIXED: Filter Logic + Debounce
  const applyFilters = useCallback(() => {
    let filtered = [...students];
    
    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.fatherName?.toLowerCase().includes(search.toLowerCase().trim())
      );
    }
    
    // Caste filter
    if (filters.caste) filtered = filtered.filter(s => s.caste === filters.caste);
    
    // Gender filter
    if (filters.gender) filtered = filtered.filter(s => s.gender === filters.gender);
    
    // Year filter
    if (filters.yearOfStudy) filtered = filtered.filter(s => s.yearOfStudy === filters.yearOfStudy);
    
    setFilteredStudents(filtered);
    setCurrentPage(0);
  }, [students, search, filters]);

  // Debounced filter application
  useEffect(() => {
    const timeoutId = setTimeout(applyFilters, 300);
    return () => clearTimeout(timeoutId);
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Export functions (same as before - compact)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`${collegeName} - ${groupName}`, 105, 15, { align: "center" });
    autoTable(doc, {
      startY: 25,
      head: [["S.No", "Name", "Father", "Mobile", "Caste", "Gender", "Year", "Adm.No"]],
      body: filteredStudents.map((s, idx) => [
        idx + 1, s.name, s.fatherName, s.mobile, s.caste, s.gender, s.yearOfStudy, s.admissionNo
      ]),
    });
    doc.save(`${groupName}_students.pdf`);
  };

  const handleExportExcel = () => {
    const data = filteredStudents.map((s, idx) => ({
      SNo: idx + 1, Name: s.name, Father: s.fatherName, Mobile: s.mobile,
      Group: s.group, Caste: s.caste, Gender: s.gender, Year: s.yearOfStudy, AdmNo: s.admissionNo
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${groupName}_Students`);
    XLSX.writeFile(wb, `${groupName}_students.xlsx`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write(`
      <html><head><title>${groupName} Students</title>
      <style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ccc;padding:4px;text-align:center}th{background:#4f46e5;color:white}</style></head>
      <body><h2>${collegeName} - ${groupName}</h2>${tableRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete ${groupName} student?`)) return;
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
      setStudents(prev => prev.filter(s => s._id !== id));
      toast.success("Deleted ✅");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (student) => setEditingStudent(student);
  const handleUpdate = async (updatedStudent) => {
    try {
      await fetch(`/api/students/${updatedStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });
      setStudents(prev => prev.map(s => s._id === updatedStudent._id ? updatedStudent : s));
      setEditingStudent(null);
      toast.success("Updated ✅");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const offset = currentPage * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(offset, offset + studentsPerPage);
  const pageCount = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl">
        <div className="flex items-center gap-3">
          <School className="w-8 h-8" />
          <span className="text-xl font-bold">{collegeName}</span>
          <div className="bg-white/20 px-4 py-1 rounded-full text-lg font-black">{groupName}</div>
        </div>
        <p className="text-sm opacity-90">Total: {students.length} | Filtered: {filteredStudents.length}</p>
      </div>

      {/* Compact Filters */}
      {/* Filters */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-3 bg-white/60 rounded-lg">
  <input 
    placeholder="🔍 Search Name" 
    value={search} 
    onChange={handleSearchChange}
    className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
  />
  <select
    name="caste"
    value={filters.caste}
    onChange={handleFilterChange}
    className="p-2 border rounded-lg text-sm"
  >
    <option value="">Caste</option>
    <option value="OC">OC</option>
    <option value="BC-A">BC-A</option>
    <option value="BC-B">BC-B</option>
    <option value="SC">SC</option>
    <option value="ST">ST</option>
  </select>
  <select
    name="gender"
    value={filters.gender}
    onChange={handleFilterChange}
    className="p-2 border rounded-lg text-sm"
  >
    <option value="">Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
  </select>
  <select
    name="yearOfStudy"
    value={filters.yearOfStudy}
    onChange={handleFilterChange}
    className="p-2 border rounded-lg text-sm"
  >
    <option value="">Year</option>
    <option value="First Year">1st Year</option>
    <option value="Second Year">2nd Year</option>
  </select>
  <button
    onClick={() => {
      setSearch("");
      setFilters({ caste: "", gender: "", yearOfStudy: "" });
    }}
    className="md:col-span-4 bg-red-500 text-white p-2 rounded-lg text-xs font-bold hover:bg-red-600"
  >
    Clear Filters
  </button>
</div>


      {/* Compact Export Buttons */}
      <div className="flex flex-wrap gap-2 p-2 bg-white/70 rounded-lg">
        <button onClick={handleExportPDF} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 flex items-center gap-1">
          <FileSpreadsheet className="w-4 h-4" /> PDF
        </button>
        <button onClick={handleExportExcel} className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600 flex items-center gap-1">
          <FileDown className="w-4 h-4" /> Excel
        </button>
        <button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 flex items-center gap-1">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {/* ✅ COMPACT RESPONSIVE TABLE */}
      {/* Students Table - mobile-friendly horizontal scroll */}
<div className="w-full overflow-x-auto bg-white rounded-xl shadow-lg border" ref={tableRef}>
  <table className="min-w-max table-auto text-xs">
    <thead className="bg-gray-900 text-white">
      <tr>
        <th className="px-2 py-2 text-center">No</th>
        <th className="px-2 py-2">Name</th>
        <th className="px-2 py-2">Father</th>
        <th className="px-2 py-2">Mobile</th>
        <th className="px-2 py-2">Caste</th>
        <th className="px-2 py-2">Gen</th>
        <th className="px-2 py-2">Year</th>
        <th className="px-2 py-2">Adm.No</th>
        <th className="px-2 py-2 text-center">Photo</th>
        <th className="px-2 py-2 text-center">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {paginatedStudents.map((s, idx) => (
        <tr key={s._id} className="hover:bg-gray-50">
          <td className="px-2 py-2 text-center font-semibold">{offset + idx + 1}</td>
          <td className="px-2 py-2 max-w-[140px] truncate text-xs font-semibold">
            {s.name}
          </td>
          <td className="px-2 py-2 max-w-[120px] truncate text-xs">
            {s.fatherName}
          </td>
          <td className="px-2 py-2 text-xs">{s.mobile}</td>
          <td className="px-2 py-2 text-xs">{s.caste}</td>
          <td className="px-2 py-2 text-xs">{s.gender?.[0]}</td>
          <td className="px-2 py-2 text-xs">{s.yearOfStudy?.split(" ")[0]}</td>
          <td className="px-2 py-2 text-xs">{s.admissionNo}</td>
          <td className="px-2 py-2 text-center">
            {s.photo ? (
              <Image
                src={s.photo}
                alt="Photo"
                width={28}
                height={28}
                className="rounded object-cover mx-auto"
              />
            ) : (
              <span className="text-[10px] text-gray-400">-</span>
            )}
          </td>
          <td className="px-2 py-2">
            <div className="flex gap-1 justify-center">
              <button
                onClick={() => handleEdit(s)}
                className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(s._id)}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Compact Pagination */}
      <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg shadow">
        <ReactPaginate
          previousLabel="←"
          nextLabel="→"
          breakLabel="..."
          pageCount={pageCount}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          containerClassName="flex items-center gap-1"
          pageClassName="w-8 h-8 flex items-center justify-center border rounded text-xs font-bold hover:bg-blue-100"
          activeClassName="bg-blue-500 text-white"
          previousClassName="w-8 h-8 border rounded text-xs font-bold hover:bg-blue-100"
          nextClassName="w-8 h-8 border rounded text-xs font-bold hover:bg-blue-100"
          forcePage={currentPage}
        />
        <span className="text-sm text-gray-700">
          Page {currentPage + 1} / {pageCount} | {filteredStudents.length} students
        </span>
      </div>

      {/* Compact Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-center">Edit Student</h3>
            <div className="space-y-3">
              <input value={editingStudent.name || ''} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} 
                     placeholder="Name" className="w-full p-3 border rounded-lg" />
              <input value={editingStudent.fatherName || ''} onChange={(e) => setEditingStudent({...editingStudent, fatherName: e.target.value})} 
                     placeholder="Father Name" className="w-full p-3 border rounded-lg" />
              <input value={editingStudent.mobile || ''} onChange={(e) => setEditingStudent({...editingStudent, mobile: e.target.value})} 
                     placeholder="Mobile" className="w-full p-3 border rounded-lg" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => handleUpdate(editingStudent)} 
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600">
                Save
              </button>
              <button onClick={() => setEditingStudent(null)} 
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
