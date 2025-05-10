"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

export default function AttendanceView() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("M&AT");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [attendanceRes, studentsRes] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/students")
      ]);

      const attendanceJson = await attendanceRes.json();
      const studentsJson = await studentsRes.json();

      const studentsById = {};
      studentsJson.data.forEach((student) => {
        studentsById[student._id] = student;
      });

      setAttendanceData(attendanceJson.data || []);
      setStudentsMap(studentsById);
    }

    fetchData();
  }, []);

  useEffect(() => {
    let data = [...attendanceData];
    if (groupFilter) {
      data = data.map(entry => {
        const filteredRecords = {};
        Object.entries(entry.records).forEach(([id, status]) => {
          if (studentsMap[id]?.group === groupFilter) {
            filteredRecords[id] = status;
          }
        });
        return { ...entry, records: filteredRecords };
      }).filter(entry => Object.keys(entry.records).length > 0);
    }

    if (dateFilter) {
      data = data.filter(entry => new Date(entry.date).toISOString().split("T")[0] === dateFilter);
    }

    setFilteredData(data);
  }, [attendanceData, studentsMap, groupFilter, dateFilter]);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Attendance Records</h2>

      <div className="flex gap-4 mb-6">
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="">All Groups</option>
          <option value="M&AT">M&amp;AT</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />
      </div>

      {filteredData.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        filteredData.map((entry, index) => (
          <div key={index} className="border rounded-md p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-5 h-5" />
              <span className="font-medium">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
            <ul className="ml-4 list-disc">
              {Object.entries(entry.records).map(([id, status]) => (
                <li key={id}>
                  <span className="font-semibold">
                    {studentsMap[id]?.name || id}
                  </span>
                  : {status}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
