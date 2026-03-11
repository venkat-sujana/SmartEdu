//app/attendance-records/attendance-calendar/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {motion} from "framer-motion";

const groupsList = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// 🛑 Public Holidays (month is 0-based)
const publicHolidays = [
  { month: 0, day: 26, name: "Republic Day" },
  { month: 5, day: 7, name: "Bakrid" },
  { month: 7, day: 15, name: "Indipenance Day" },
  { month: 7, day: 8, name: "Varalaksmi vratham" },
  { month: 7, day: 16, name: "krishnastami" },
  { month: 7, day: 27, name: "Vinayaka Chavithi "},
  { month: 8, day: 15, name: "Quarterly Exams" },
  { month: 8, day: 16, name: "Quarterly Exams" },
  { month: 8, day: 17, name: "Quarterly Exams" },
  { month: 8, day: 18, name: "Quarterly Exams" },
  { month: 8, day: 19, name: "Quarterly Exams" },
  { month: 8, day: 20, name: "Quarterly Exams" },
  { month: 8, day: 28, name: "Dussara holidays" },
  { month: 8, day: 29, name: "Dussara holidays" },
  { month: 8, day: 30, name: "Dussara holidays" },
  { month: 9, day: 1, name: "Dussara holidays" },
  { month: 9, day: 2, name: "Gandhi Jayanthi" },
  { month: 9, day: 3, name: "Dussara holidays" },
  { month: 9, day: 4, name: "Dussara holidays" },
  { month: 9, day: 6, name: "Re open after Dussara holidays" },
];

// 🔹 Helper for Second Saturday
function isSecondSaturday(dateObj) {
  return dateObj.getDay() === 6 && dateObj.getDate() > 7 && dateObj.getDate() <= 14;
}

export default function CalendarView() {
  const { data: session } = useSession();
  const [group, setGroup] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  useEffect(() => {
    if (group && yearOfStudy && session?.user?.collegeId) {
      
      fetch(`/api/students?collegeId=${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.data.filter(
            (s) => s.group === group && s.yearOfStudy === yearOfStudy
          );
          setStudents(filtered);
          setStudentId("");
        });
    } else {
      setStudents([]);
      setStudentId("");
    }
  }, [group, yearOfStudy, session]);

  useEffect(() => {
    if (studentId) {
      fetch(`/api/attendance/monthly?studentId=${studentId}&month=${month}&year=${year}`)
        .then((res) => res.json())
        .then((data) => setAttendanceData(data.data || []));
    }
  }, [studentId, month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ✅ Attendance map
  const attendanceMap = Object.fromEntries(
    (attendanceData || []).map((r) => [new Date(r.date).getDate(), r.status])
  );

  const selectedStudent = students.find((s) => s._id?.toString() === studentId?.toString());
  const joinDateObj = selectedStudent?.joinDate ? new Date(selectedStudent.joinDate) : null;

  // ✅ Present / Absent counts
  const presentCount = Object.values(attendanceMap).filter((s) => s === "Present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "Absent").length;

  // ✅ Working days = Present + Absent only
  const workingDays = presentCount + absentCount;

  // ✅ Attendance %
  const attendancePercentage = workingDays > 0 
    ? ((presentCount / workingDays) * 100).toFixed(2) 
    : "0";

  return (
    <div className="max-w-6xl mx-auto p-4 mt-24">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
        {collegeName || "Your College"} Monthly Attendance - {year}
      </h1>

      {/* Sticky Filters */}
      <div className="sticky top-0 bg-white z-10 shadow-md p-3 rounded-lg mb-4 flex flex-wrap gap-3 justify-center">
        <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} className="border p-2 rounded-lg shadow-sm">
          <option value="">Select Year</option>
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
        </select>

        <select value={group} onChange={(e) => setGroup(e.target.value)} className="border p-2 rounded-lg shadow-sm">
          <option value="">Select Group</option>
          {groupsList.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="border p-2 rounded-lg shadow-sm">
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="border p-2 rounded-lg shadow-sm">
          {monthNames.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border p-2 rounded-lg shadow-sm">
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - 2 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      {/* Top Actions */}
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        <Link href="/attendance-form">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 shadow-md font-semibold">📝 Attendance Form</button>
        </Link>
        <Link href="/attendance-records">
          <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 shadow-md font-semibold">📂 Attendance Records</button>
        </Link>
      </div>

    
{/* Student Info */}
{selectedStudent && (
  <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-4">
    <div className="mb-4">
      <p className="font-semibold">
        Student: <span className="font-normal">{selectedStudent.name}</span>
      </p>
      {joinDateObj && (
        <p className="font-semibold">
          Join Date:{" "}
          <span className="font-normal">
            {joinDateObj.toLocaleDateString()}
          </span>
        </p>
      )}
    </div>

    {/* Animated Summary Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { value: presentCount, label: "Present", color: "bg-green-100", icon: "✅" },
        { value: absentCount, label: "Absent", color: "bg-red-100", icon: "❌" },
        { value: workingDays, label: "Working Days", color: "bg-yellow-100", icon: "📅" },
        { value: `${attendancePercentage}%`, label: "Attendance", color: "bg-blue-100", icon: "📊" },
      ].map((card, index) => (
        <motion.div
          key={index}
          className={`${card.color} p-4 rounded-2xl shadow flex flex-col items-center`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl">{card.icon}</span>
          <p className="font-bold text-lg">{card.value}</p>
          <p className="text-sm">{card.label}</p>
        </motion.div>
      ))}
    </div>
  </div>
)}



      {/* Calendar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {[...Array(daysInMonth)].map((_, day) => {
          const date = day + 1;
          const currentDateObj = new Date(year, month, date);
          const dayOfWeek = currentDateObj.getDay();
          const status = attendanceMap[date] || "N/A";
          const beforeJoin = joinDateObj && currentDateObj < joinDateObj;
          const isSunday = dayOfWeek === 0;
          const isSecondSat = isSecondSaturday(currentDateObj);
          const holiday = publicHolidays.find(h => h.month === month && h.day === date);

          let color = "bg-gray-100";
          if (beforeJoin) color = "bg-gray-300 opacity-60";
          else if (holiday) color = "bg-yellow-100 hover:bg-yellow-200 transition-colors";
          else if (isSunday || isSecondSat) color = "bg-orange-100 hover:bg-orange-400 transition-colors";
          else if (status === "Present") color = "bg-green-200 hover:bg-green-400 transition-colors";
          else if (status === "Absent") color = "bg-red-100 hover:bg-red-400 transition-colors";

          return (
            <div 
              key={date} 
              className={`${color} p-3 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-between min-h-[120px]`}
              title={holiday?.name || status}
            >
              <div className="font-bold text-lg">{date}</div>
              {holiday && <div className="text-xs text-red-700 text-center">{holiday.name}</div>}
              {isSunday && !holiday && <div className="text-xs text-blue-700">Sunday</div>}
              {isSecondSat && !holiday && <div className="text-xs text-purple-700">2nd Saturday</div>}
              {beforeJoin && <div className="text-xs text-gray-600">Before Join</div>}

              {!beforeJoin && !isSunday && !isSecondSat && !holiday && (
                status === "Present" ? (
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="text-green-700 text-lg">✅</div>
                    {selectedStudent?.photo && (
                      <img
                        src={selectedStudent.photo}
                        alt="Student"
                        onError={(e) => { e.target.src = "/default-avatar.png"; }}
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border border-gray-300"
                      />
                    )}
                    <p className="text-xs text-gray-700">{selectedStudent?.name}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{status}</p>
                    {status === "Absent" && selectedStudent?._id && (
                      <Link
                        href={`/attendance-records/${selectedStudent._id}/absent-reason?date=${year}-${month + 1}-${date}`}
                      >
                        <button className="text-xs text-blue-500 hover:underline mt-1">
                          View Reason
                        </button>
                      </Link>
                    )}
                  </>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
