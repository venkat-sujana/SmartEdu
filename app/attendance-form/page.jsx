"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
const AttendanceForm = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const groupsList = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStudents(data.data);
        }
      })
      .catch((err) => console.error("Error fetching students", err));
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      const filtered = students.filter((s) => s.group === selectedGroup);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGroup, students]);

  const handleToggleChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedGroup || filteredStudents.length === 0) {
      alert("Please select a date, group, and ensure students are visible.");
      return;
    }

    const dateObj = new Date(selectedDate);
    const month = monthsList[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    const attendanceRecords = filteredStudents.map((student) => ({
      studentId: student._id,
      date: selectedDate,
      status: attendanceData[student._id] || "Absent",
      group: selectedGroup,
      month,
      year,
    }));

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceRecords),
      });

      const result = await response.json();
      alert(result.message || "Attendance submitted");
    } catch (error) {
      console.error("Submit error", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

      <Link href="/attendance-records">
        <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition cursor-pointer font-bold">
          Attendance-Records
        </button>
      </Link>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-1 block w-full border rounded-md px-3 py-2"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Group</label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        >
          <option value="">Select Group</option>
          {groupsList.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          >
            <option value="">Select Month</option>
            {monthsList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          >
            <option value="">Select Year</option>
            {yearsList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredStudents.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Students List</h3>
          <div className="space-y-2">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
              >
                <span>{student.name}</span>
                <div>
                  <button
                    onClick={() => handleToggleChange(student._id, "Present")}
                    className={`px-3 py-1 rounded-md text-white mr-2 ${
                      attendanceData[student._id] === "Present"
                        ? "bg-green-600"
                        : "bg-gray-400"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleToggleChange(student._id, "Absent")}
                    className={`px-3 py-1 rounded-md text-white ${
                      attendanceData[student._id] === "Absent"
                        ? "bg-red-600"
                        : "bg-gray-400"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredStudents.length > 0 && (
        <div className="mt-6 text-right">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Submit Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;
