"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        const result = await res.json();
        console.log("Fetched students:", result);
        setStudents(result.data); // ✅ correct
        setFilteredStudents(result.data); // ✅ correct
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">S.K.R.GOVERNMENT JUNIOR COLLEGE</h1>

      {/* Search + Filters */}
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

      {/* Table */}
      <div className="overflow-x-auto">
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
            {Array.isArray(filteredStudents) && filteredStudents.map((s, idx) => (
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
