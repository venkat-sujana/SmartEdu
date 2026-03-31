"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  getPublicHoliday,
  isSecondSaturday,
  isSunday,
} from "@/lib/attendanceCalendar";

const groupsList = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const monthNames = [
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

function getDayStatus({
  currentDate,
  joinDate,
  attendanceMap,
}) {
  const recordedStatus = attendanceMap[currentDate.getDate()];
  const holiday = getPublicHoliday(currentDate);

  if (joinDate && currentDate < joinDate) {
    return { status: "Before Join", holiday: null, sunday: false, secondSaturday: false };
  }

  if (holiday) {
    return { status: holiday.name, holiday, sunday: false, secondSaturday: false };
  }

  if (isSunday(currentDate)) {
    return { status: "Sunday", holiday: null, sunday: true, secondSaturday: false };
  }

  if (isSecondSaturday(currentDate)) {
    return { status: "2nd Saturday", holiday: null, sunday: false, secondSaturday: true };
  }

  return {
    status: recordedStatus || "N/A",
    holiday: null,
    sunday: false,
    secondSaturday: false,
  };
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
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName);
    }
  }, [session]);

  useEffect(() => {
    if (group && yearOfStudy && session?.user?.collegeId) {
      fetch(`/api/students?collegeId=${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          const filtered = (data.data || []).filter(
            (student) => student.group === group && student.yearOfStudy === yearOfStudy
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
    if (!studentId) {
      setAttendanceData([]);
      return;
    }

    fetch(`/api/attendance/monthly?studentId=${studentId}&month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => setAttendanceData(data.data || []));
  }, [studentId, month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const attendanceMap = useMemo(
    () =>
      Object.fromEntries(
        (attendanceData || []).map((record) => [
          new Date(record.date).getDate(),
          record.status,
        ])
      ),
    [attendanceData]
  );

  const selectedStudent = students.find(
    (student) => student._id?.toString() === studentId?.toString()
  );
  const joinDateObj = selectedStudent?.joinDate
    ? new Date(selectedStudent.joinDate)
    : null;

  const presentCount = Object.values(attendanceMap).filter(
    (status) => status === "Present"
  ).length;
  const absentCount = Object.values(attendanceMap).filter(
    (status) => status === "Absent"
  ).length;
  const workingDays = presentCount + absentCount;
  const attendancePercentage =
    workingDays > 0 ? ((presentCount / workingDays) * 100).toFixed(2) : "0";

  const naCount = useMemo(() => {
    let total = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(year, month, day);
      const { status } = getDayStatus({
        currentDate,
        joinDate: joinDateObj,
        attendanceMap,
      });

      if (status === "N/A") {
        total += 1;
      }
    }

    return total;
  }, [attendanceMap, daysInMonth, joinDateObj, month, year]);

  return (
    <div className="max-w-6xl mx-auto p-4 mt-24">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
        {collegeName || "Your College"} Monthly Attendance - {year}
      </h1>

      <div className="sticky top-0 bg-white z-10 shadow-md p-3 rounded-lg mb-4 flex flex-wrap gap-3 justify-center">
        <select
          value={yearOfStudy}
          onChange={(e) => setYearOfStudy(e.target.value)}
          className="border p-2 rounded-lg shadow-sm"
        >
          <option value="">Select Year</option>
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
        </select>

        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border p-2 rounded-lg shadow-sm"
        >
          <option value="">Select Group</option>
          {groupsList.map((groupName) => (
            <option key={groupName} value={groupName}>
              {groupName}
            </option>
          ))}
        </select>

        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="border p-2 rounded-lg shadow-sm"
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="border p-2 rounded-lg shadow-sm"
        >
          {monthNames.map((monthName, index) => (
            <option key={monthName} value={index}>
              {monthName}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="border p-2 rounded-lg shadow-sm"
        >
          {[...Array(5)].map((_, index) => {
            const yearValue = new Date().getFullYear() - 2 + index;
            return (
              <option key={yearValue} value={yearValue}>
                {yearValue}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        <Link href="/attendance-form">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 shadow-md font-semibold">
            Attendance Form
          </button>
        </Link>
        <Link href="/attendance-records">
          <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 shadow-md font-semibold">
            Attendance Records
          </button>
        </Link>
      </div>

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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { value: presentCount, label: "Present", color: "bg-green-100", icon: "P" },
              { value: absentCount, label: "Absent", color: "bg-red-100", icon: "A" },
              { value: naCount, label: "N/A", color: "bg-slate-100", icon: "N" },
              { value: workingDays, label: "Working Days", color: "bg-yellow-100", icon: "W" },
              { value: `${attendancePercentage}%`, label: "Attendance", color: "bg-blue-100", icon: "%" },
            ].map((card, index) => (
              <motion.div
                key={card.label}
                className={`${card.color} p-4 rounded-2xl shadow flex flex-col items-center`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl font-bold">{card.icon}</span>
                <p className="font-bold text-lg">{card.value}</p>
                <p className="text-sm">{card.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {[...Array(daysInMonth)].map((_, index) => {
          const date = index + 1;
          const currentDate = new Date(year, month, date);
          const { status, holiday, sunday, secondSaturday } = getDayStatus({
            currentDate,
            joinDate: joinDateObj,
            attendanceMap,
          });

          let color = "bg-gray-100";
          if (status === "Before Join") color = "bg-gray-300 opacity-60";
          else if (holiday) color = "bg-yellow-100 hover:bg-yellow-200 transition-colors";
          else if (sunday || secondSaturday) color = "bg-orange-100 hover:bg-orange-400 transition-colors";
          else if (status === "Present") color = "bg-green-200 hover:bg-green-400 transition-colors";
          else if (status === "Absent") color = "bg-red-100 hover:bg-red-400 transition-colors";

          return (
            <div
              key={date}
              className={`${color} p-3 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-between min-h-[120px]`}
              title={status}
            >
              <div className="font-bold text-lg">{date}</div>
              {holiday && <div className="text-xs text-red-700 text-center">{holiday.name}</div>}
              {sunday && !holiday && <div className="text-xs text-blue-700">Sunday</div>}
              {secondSaturday && !holiday && (
                <div className="text-xs text-purple-700">2nd Saturday</div>
              )}
              {status === "Before Join" && (
                <div className="text-xs text-gray-600">Before Join</div>
              )}

              {!holiday && !sunday && !secondSaturday && status !== "Before Join" && (
                status === "Present" ? (
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="text-green-700 text-lg">Present</div>
                    {selectedStudent?.photo && (
                      <img
                        src={selectedStudent.photo}
                        alt="Student"
                        onError={(event) => {
                          event.target.src = "/default-avatar.png";
                        }}
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
