"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const groupsList = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const monthsList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const yearsList = ["First Year", "Second Year"];
const sessionList = ["FN", "AN"];

export default function AttendanceForm() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  const [collegeId, setCollegeId] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const router = useRouter();
  
  // Fixed return URL - always goes to mandat dashboard
  const returnUrl = '/dashboards/mandat';

  const [fullscreenToastMessage, setFullscreenToastMessage] = useState(null);

  useEffect(() => {
    if (session?.user?.collegeId) setCollegeId(session.user.collegeId);
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  useEffect(() => {
    if (!collegeId) return;
    fetch(`/api/lecturers?collegeId=${collegeId}`)
      .then(res => res.json())
      .then(json => {
        console.log('Lecturers API Response:', json);
        if (json.status === "success") setLecturers(json.data);
      });
  }, [collegeId]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGroup || !session?.user?.collegeId) return;
      const res = await fetch(
        `/api/students?collegeId=${session.user.collegeId}&group=${encodeURIComponent(selectedGroup)}`
      );
      const json = await res.json();
      if (json.status === "success") setStudents(json.data);
    };
    fetchStudents();
  }, [selectedGroup, session]);

  useEffect(() => {
    if (selectedGroup && selectedYearOfStudy) {
      setFilteredStudents(
        students.filter(
          (s) => s.group === selectedGroup && s.yearOfStudy === selectedYearOfStudy
        )
      );
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGroup, selectedYearOfStudy, students]);

  const handleToggleChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev, [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedGroup || filteredStudents.length === 0 || !selectedLecturerId || !selectedSession) {
      setFullscreenToastMessage("Select date, group, session and lecturer. Ensure students visible.");
      return;
    }
    const dateObj = new Date(selectedDate);
    const month = monthsList[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    const lecturerInfo = lecturers.find(l => l._id === selectedLecturerId);

    const attendanceRecords = filteredStudents.map((student) => ({
      studentId: student._id,
      date: selectedDate,
      status: attendanceData[student._id] || "Absent",
      group: selectedGroup.toUpperCase(),
      month,
      yearOfStudy: selectedYearOfStudy,
      lecturerId: selectedLecturerId,
      lecturerName: lecturerInfo?.name || "",
      collegeId,
      year,
      session: selectedSession
    }));

    setIsLoading(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceRecords),
        credentials: "include"
      });
      const result = await response.json();
      if (response.status === 400 && result.status === "error") {
        setFullscreenToastMessage(result.message || "Attendance already taken!");
        setIsLoading(false);
        return;
      }
      
      if (result.status === "success") {
        setFullscreenToastMessage(result.message || "Attendance submitted successfully!");
        setSelectedGroup("");
        setSelectedYearOfStudy("");
        setSelectedDate("");
        setSelectedLecturerId("");
        setSelectedSession("");
        setFilteredStudents([]);
        setAttendanceData({});
        setStudents([]);
        
        // Navigate to mandat dashboard after 2 seconds
        setTimeout(() => {
          router.push(returnUrl);
        }, 2000);
      } else {
        setFullscreenToastMessage(result.message || "Something went wrong!");
      }
    } catch (error) {
      setFullscreenToastMessage("Error submitting attendance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-24 relative min-h-screen bg-gradient-to-br from-blue-200 via-white to-green-50 py-5 px-2">
      {/* Fullscreen Toast Overlay */}
      {fullscreenToastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white rounded-xl px-8 py-6 text-xl font-bold shadow-xl border-2 flex flex-col items-center ${
              fullscreenToastMessage && fullscreenToastMessage.includes("already marked")
                ? "text-red-700 border-red-400"
                : "text-green-700 border-green-400"
            }`}
          >
            <span className="text-3xl mb-3">
              {fullscreenToastMessage && fullscreenToastMessage.includes("already marked") ? "❌" : "✅"}
            </span>
            <span className="mb-3">{fullscreenToastMessage}</span>
            <button
              className="mt-2 px-6 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-800 font-bold text-lg"
              onClick={() => setFullscreenToastMessage(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-40 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl border-2 border-blue-100">
        <div className="flex flex-col items-center mb-5">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 via-green-50 to-indigo-50 border px-4 py-2 rounded-2xl text-blue-700 font-bold shadow">
            <span className="text-2xl">🏫</span>
            <span className="tracking-wide">{collegeName || "Loading..."}</span>
          </div>
          <h1 className="text-2xl font-bold my-2 text-blue-800">Mark Attendance</h1>
          <p className="text-gray-500">Select date, group, session and ensure students are visible.</p>
        </div>

        {/* Fixed Back Button */}
        <div className="mb-4 flex justify-end">
          <Link href={returnUrl}>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700 cursor-pointer font-bold">
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full border-2 border-blue-400 rounded-xl px-3 py-2 text-base focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Year</label>
            <select
              value={selectedYearOfStudy}
              onChange={(e) => setSelectedYearOfStudy(e.target.value)}
              className="block w-full border-2 border-blue-400 rounded-xl px-3 py-2 text-base bg-white focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Year</option>
              {yearsList.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="block w-full border-2 border-blue-400 rounded-xl px-3 py-2 text-base bg-white focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Group</option>
              {groupsList.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="block w-full border-2 border-blue-400 rounded-xl px-3 py-2 text-base bg-white focus:ring-2 focus:ring-indigo-400"
              required
            >
              <option value="">Select Session</option>
              {sessionList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Lecturer</label>
            <select
              value={selectedLecturerId}
              onChange={(e) => setSelectedLecturerId(e.target.value)}
              className="block w-full border-2 border-blue-400 rounded-xl px-3 py-2 text-base bg-white focus:ring-2 focus:ring-indigo-400"
              required
            >
              <option value="">Select Lecturer</option>
              {lecturers.map((lec) => (
                <option key={lec._id} value={lec._id}>
                  {lec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold mb-4 text-blue-700">Students List</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-2xl shadow p-4 flex flex-col items-center space-y-2 transition hover:shadow-2xl"
                >
                  <img
                    src={student.photo || "/default-avatar.png"}
                    alt={student.name}
                    className="w-20 h-20 object-cover rounded-full border-2 border-blue-400 shadow"
                  />
                  <h4 className="text-lg font-bold text-gray-700 text-center">{student.name}</h4>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleToggleChange(student._id, "Present")}
                      className={`px-4 py-1 rounded-full text-white text-sm font-bold shadow-lg transition ${
                        attendanceData[student._id] === "Present"
                          ? "bg-green-600"
                          : "bg-gray-400 hover:bg-green-500"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleToggleChange(student._id, "Absent")}
                      className={`px-4 py-1 rounded-full text-white text-sm font-bold shadow-lg transition ${
                        attendanceData[student._id] === "Absent"
                          ? "bg-red-600"
                          : "bg-gray-400 hover:bg-red-500"
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

        {/* Submit Button */}
        {filteredStudents.length > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg text-lg transition disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
