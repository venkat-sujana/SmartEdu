//app/attendance-form/page.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AttendanceForm = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

 const { data: session } = useSession();
 console.log("SESSION: ", session);
 
 const [collegeId, setCollegeId] = useState('');
 const [collegeName, setCollegeName] = useState('');

   useEffect(() => {
     if (session?.user?.collegeId) {
       setCollegeId(session.user.collegeId);
     }
     if (session?.user?.collegeName) {
       setCollegeName(session.user.collegeName);
     }
   }, [session]);


  const groupsList = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const yearsList = ["First Year", "Second Year"];
  const router = useRouter();

useEffect(() => {
  const fetchStudents = async () => {
    if (!selectedGroup || !session?.user?.collegeId) return;

    const encodedGroup = encodeURIComponent(selectedGroup);
    const res = await fetch(
      `/api/students?collegeId=${session.user.collegeId}&group=${encodedGroup}`
    );
    const json = await res.json();
    if (json.status === "success") {
      setStudents(json.data);
    }
  };
  fetchStudents();
}, [selectedGroup, session]);






  useEffect(() => {
    if (selectedGroup && selectedYearOfStudy) {
      const filtered = students.filter(
        (s) =>
          s.group === selectedGroup && s.yearOfStudy === selectedYearOfStudy
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGroup, selectedYearOfStudy, students]);



  const handleToggleChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };




  const handleSubmit = async () => {
    if (!selectedDate || !selectedGroup || filteredStudents.length === 0) {
      toast.error(
        "Please select a date, group, and ensure students are visible."
      );
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
      yearOfStudy: selectedYearOfStudy, // 🔥 Add this line
    }));

    setIsLoading(true);
    const toastId = toast.loading("Submitting attendance...");

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceRecords),
      });

      const result = await response.json();
      toast.dismiss(toastId);
      toast.success(result.message || "Attendance submitted successfully!");
     router.push("/attendance-form");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Error submitting attendance");
      console.error("Submit error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-white mt-4 ">
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-xl font-bold text-center text-blue-800 mb-2">

  <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
  <span className="font-semibold">🏫</span> {collegeName || "Loading..."}
</div>

</h1>

        <p className="text-gray-600 mb-4">
          👉 Note:-Please select a date, group, and ensure students are visible.
        </p>

        <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

        <Link href="/attendance-records">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 cursor-pointer">
            🏠&nbsp; Attendance Records
          </button>
        </Link>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Year of Study
          </label>
          <select
            value={selectedYearOfStudy}
            onChange={(e) => setSelectedYearOfStudy(e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          >
            <option value="">Select Year</option>
            {yearsList.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Group
          </label>
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

        {filteredStudents.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Students List</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="bg-white border border-gray-200 rounded-xl shadow p-4 flex flex-col items-center space-y-2"
                >
                  <img
                    src={student.photo || "/default-avatar.png"}
                    alt={student.name}
                    className="w-24 h-24 object-cover rounded-full border-2 border-blue-400"
                  />
                  <h4 className="text-lg font-semibold text-gray-800">
                    {student.name}
                  </h4>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleChange(student._id, "Present")}
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        attendanceData[student._id] === "Present"
                          ? "bg-green-600"
                          : "bg-gray-400"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleToggleChange(student._id, "Absent")}
                      className={`px-3 py-1 rounded-full text-white text-sm ${
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
    </div>
  );
};

export default AttendanceForm;
