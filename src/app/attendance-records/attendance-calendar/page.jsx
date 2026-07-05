//src/app/attendance-records/attendance-calendar/page.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { getPublicHoliday, isSecondSaturday, isSunday } from '@/lib/attendanceCalendar'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const groupsList = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const statusTheme = {
  present: {
    cell: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
  },
  absent: {
    cell: 'border-rose-200 bg-rose-50 text-rose-900',
    badge: 'bg-rose-600 text-white',
    dot: 'bg-rose-500',
  },
  holiday: {
    cell: 'border-amber-200 bg-amber-50 text-amber-900',
    badge: 'bg-amber-500 text-white',
    dot: 'bg-amber-500',
  },
  weekend: {
    cell: 'border-orange-200 bg-orange-50 text-orange-900',
    badge: 'bg-orange-500 text-white',
    dot: 'bg-orange-500',
  },
  beforeJoin: {
    cell: 'border-slate-200 bg-slate-100 text-slate-500',
    badge: 'bg-slate-400 text-white',
    dot: 'bg-slate-400',
  },
  empty: {
    cell: 'border-slate-200 bg-white text-slate-700',
    badge: 'bg-slate-500 text-white',
    dot: 'bg-slate-400',
  },
}

function getDayStatus({ currentDate, joinDate, attendanceMap }) {
  const recordedStatus = attendanceMap[currentDate.getDate()]
  const holiday = getPublicHoliday(currentDate)

  if (joinDate && currentDate < joinDate) {
    return {
      status: 'Before Join',
      holiday: null,
      sunday: false,
      secondSaturday: false,
    }
  }

  if (holiday) {
    return { status: holiday.name, holiday, sunday: false, secondSaturday: false }
  }

  if (isSunday(currentDate)) {
    return { status: 'Sunday', holiday: null, sunday: true, secondSaturday: false }
  }

  if (isSecondSaturday(currentDate)) {
    return { status: '2nd Saturday', holiday: null, sunday: false, secondSaturday: true }
  }

  return {
    status: recordedStatus || 'N/A',
    holiday: null,
    sunday: false,
    secondSaturday: false,
  }
}

export default function CalendarView() {
  const { data: session } = useSession()
  const [group, setGroup] = useState('')
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')
  const [yearOfStudy, setYearOfStudy] = useState('')
  const [attendanceData, setAttendanceData] = useState([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [collegeName, setCollegeName] = useState('')

  // ఉన్న state లతో పాటు ఇది add చేయి
  const [reasonMap, setReasonMap] = useState({})
  // { "2026-07-02": "Fever", "2026-07-05": "" }

  const changeMonthBy = direction => {
    const nextMonthIndex = month + direction

    if (nextMonthIndex < 0) {
      setMonth(11)
      setYear(prev => prev - 1)
      return
    }

    if (nextMonthIndex > 11) {
      setMonth(0)
      setYear(prev => prev + 1)
      return
    }

    setMonth(nextMonthIndex)
  }

  useEffect(() => {
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName)
    }
  }, [session])

  useEffect(() => {
    if (group && yearOfStudy && session?.user?.collegeId) {
      const normalizedGroup = normalizeAttendanceGroup(group)

      fetch(
        `/api/students?group=${encodeURIComponent(normalizedGroup)}&yearOfStudy=${encodeURIComponent(yearOfStudy)}&limit=100`
      )
        .then(res => res.json())
        .then(data => {
          setStudents(data.data || [])
          setStudentId('')
        })
    } else {
      setStudents([])
      setStudentId('')
    }
  }, [group, yearOfStudy, session])

  useEffect(() => {
    if (!studentId) {
      setAttendanceData([])
      return
    }

    fetch(`/api/attendance?studentId=${studentId}&month=${month + 1}&year=${year}`)
      .then(res => res.json())
      .then(data => setAttendanceData(data.data || []))
  }, [studentId, month, year])

  useEffect(() => {
    if (!studentId || !attendanceData.length) {
      setReasonMap({})
      return
    }

    const absentRecords = attendanceData.filter(record => record.status === 'Absent')

    if (!absentRecords.length) {
      setReasonMap({})
      return
    }

    const fetchReasons = async () => {
      const entries = await Promise.all(
        absentRecords.map(async record => {
          const dateObj = new Date(record.date)
          const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(dateObj.getDate()).padStart(2, '0')}`

          const res = await fetch(`/api/attendance/reason?studentId=${studentId}&date=${dateStr}`)
          const data = await res.json()

          return [dateStr, data.reason || '']
        })
      )

      setReasonMap(Object.fromEntries(entries))
    }

    fetchReasons()
  }, [attendanceData, studentId])


  function generatePDF() {
  if (!selectedStudent) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFillColor(15, 118, 110); // teal
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(collegeName || "College", pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Attendance Report — ${monthLabel}`,
    pageWidth / 2,
    21,
    { align: "center" }
  );

  // ── Student Info ──
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Student Details", 14, 38);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Name        : ${selectedStudent.name || "-"}`, 14, 46);
  doc.text(
    `Year        : ${selectedStudent.yearOfStudy || "-"}`,
    14,
    52
  );
  doc.text(`Group       : ${selectedStudent.group || "-"}`, 14, 58);
  doc.text(
    `Admission No: ${selectedStudent.admissionNo || "-"}`,
    14,
    64
  );

  // ── Summary Cards ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Monthly Summary", 14, 76);

  const summaryData = [
    ["Present Days", "Absent Days", "Working Days", "Attendance %"],
    [
      String(presentCount),
      String(absentCount),
      String(workingDays),
      `${attendancePercentage}%`,
    ],
  ];

  autoTable(doc, {
    startY: 80,
    head: [summaryData[0]],
    body: [summaryData[1]],
    theme: "grid",
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    bodyStyles: {
      halign: "center",
      fontSize: 11,
      fontStyle: "bold",
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellPadding: 4 },
      1: { cellPadding: 4 },
      2: { cellPadding: 4 },
      3: { cellPadding: 4 },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Attendance Table ──
  const tableStartY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Day-wise Attendance", 14, tableStartY);

  const tableRows = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayMeta = getDayStatus({
      currentDate,
      joinDate: joinDateObj,
      attendanceMap,
    });

    const dayName = weekDayNames[currentDate.getDay()];
    const dateStr = `${String(day).padStart(2, "0")} ${monthNames[month]} ${year}`;

    let status = dayMeta.status;
    if (dayMeta.sunday) status = "Sunday";
    else if (dayMeta.secondSaturday) status = "2nd Saturday";
    else if (dayMeta.holiday) status = dayMeta.holiday.name;

    tableRows.push([dateStr, dayName, status]);
  }

  autoTable(doc, {
    startY: tableStartY + 4,
    head: [["Date", "Day", "Status"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: "auto" },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 2) {
        const val = hookData.cell.raw;
        if (val === "Present") {
          hookData.cell.styles.textColor = [5, 150, 105];
          hookData.cell.styles.fontStyle = "bold";
        } else if (val === "Absent") {
          hookData.cell.styles.textColor = [220, 38, 38];
          hookData.cell.styles.fontStyle = "bold";
        } else if (
          val === "Sunday" ||
          val === "2nd Saturday"
        ) {
          hookData.cell.styles.textColor = [180, 83, 9];
        } else if (val !== "N/A" && val !== "Before Join") {
          // Holiday
          hookData.cell.styles.textColor = [146, 64, 14];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  // ── Save ──
  const fileName = `${selectedStudent.name || "Student"}_${monthLabel.replace(" ", "_")}_Attendance.pdf`;
  doc.save(fileName);
}

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = `${monthNames[month]} ${year}`
  const firstDayOffset = new Date(year, month, 1).getDay()

  const attendanceMap = useMemo(
    () =>
      Object.fromEntries(
        (attendanceData || []).map(record => [new Date(record.date).getDate(), record.status])
      ),
    [attendanceData]
  )

  const selectedStudent = students.find(
    student => student._id?.toString() === studentId?.toString()
  )

  const joinDateObj = useMemo(
    () => (selectedStudent?.dateOfJoining ? new Date(selectedStudent.dateOfJoining) : null),
    [selectedStudent?.dateOfJoining]
  )

  const presentCount = Object.values(attendanceMap).filter(status => status === 'Present').length
  const absentCount = Object.values(attendanceMap).filter(status => status === 'Absent').length
  const workingDays = presentCount + absentCount
  const attendancePercentage =
    workingDays > 0 ? ((presentCount / workingDays) * 100).toFixed(2) : '0'

  const naCount = useMemo(() => {
    let total = 0

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(year, month, day)
      const { status } = getDayStatus({
        currentDate,
        joinDate: joinDateObj,
        attendanceMap,
      })

      if (status === 'N/A') {
        total += 1
      }
    }

    return total
  }, [attendanceMap, daysInMonth, joinDateObj, month, year])

  const calendarCells = useMemo(() => {
    const leadingEmptyCells = Array.from({ length: firstDayOffset }, (_, index) => ({
      key: `empty-${index}`,
      empty: true,
    }))

    const dayCells = Array.from({ length: daysInMonth }, (_, index) => {
      const date = index + 1
      const currentDate = new Date(year, month, date)
      const dayMeta = getDayStatus({
        currentDate,
        joinDate: joinDateObj,
        attendanceMap,
      })

      let tone = 'empty'
      if (dayMeta.status === 'Before Join') tone = 'beforeJoin'
      else if (dayMeta.holiday) tone = 'holiday'
      else if (dayMeta.sunday || dayMeta.secondSaturday) tone = 'weekend'
      else if (dayMeta.status === 'Present') tone = 'present'
      else if (dayMeta.status === 'Absent') tone = 'absent'

      return {
        key: date,
        empty: false,
        date,
        currentDate,
        tone,
        ...dayMeta,
      }
    })

    return [...leadingEmptyCells, ...dayCells]
  }, [attendanceMap, daysInMonth, firstDayOffset, joinDateObj, month, year])

  const weeklySummary = useMemo(() => {
    const weeks = []

    calendarCells.forEach((cell, index) => {
      const weekIndex = Math.floor(index / 7)

      if (!weeks[weekIndex]) {
        weeks[weekIndex] = {
          label: `Week ${weekIndex + 1}`,
          present: 0,
          absent: 0,
          holidays: 0,
        }
      }

      if (cell.empty) return
      if (cell.status === 'Present') weeks[weekIndex].present += 1
      else if (cell.status === 'Absent') weeks[weekIndex].absent += 1
      else if (cell.holiday || cell.sunday || cell.secondSaturday) {
        weeks[weekIndex].holidays += 1
      }
    })

    return weeks.filter(Boolean)
  }, [calendarCells])


  async function generateClassPDF() {
  if (!group || !yearOfStudy) return;

  const res = await fetch(
    `/api/attendance/class-monthly?group=${encodeURIComponent(group)}&yearOfStudy=${encodeURIComponent(yearOfStudy)}&month=${month + 1}&year=${year}`
  );
  const json = await res.json();

  if (json.status !== "success" || !json.data.length) {
    alert("Data లేదు. Group మరియు Year select చేయండి.");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(collegeName || "College", pageWidth / 2, 11, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Class Attendance Report — ${monthLabel}`,
    pageWidth / 2,
    19,
    { align: "center" }
  );
  doc.text(
    `${yearOfStudy} | Group: ${group}`,
    pageWidth / 2,
    25,
    { align: "center" }
  );

  // ── Summary ──
  const totalStudents = json.data.length;
  const avgPercentage = (
    json.data.reduce((sum, s) => sum + parseFloat(s.percentage), 0) /
    totalStudents
  ).toFixed(1);

  const below75 = json.data.filter((s) => parseFloat(s.percentage) < 75).length;

  autoTable(doc, {
    startY: 34,
    head: [["Total Students", "Avg Attendance %", "Below 75%"]],
    body: [[String(totalStudents), `${avgPercentage}%`, String(below75)]],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    bodyStyles: {
      halign: "center",
      fontSize: 11,
      fontStyle: "bold",
    },
    margin: { left: 14, right: 14 },
  });

  // ── Main Table ──
  const tableStartY = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Student-wise Attendance", 14, tableStartY);

  const rows = json.data.map((student, index) => [
    String(index + 1),
    student.admissionNo,
    student.name,
    String(student.present),
    String(student.absent),
    String(student.working),
    `${student.percentage}%`,
  ]);

  autoTable(doc, {
    startY: tableStartY + 4,
    head: [["#", "Adm No", "Student Name", "P", "A", "Working", "%"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 18, halign: "center" },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 6) {
        const val = parseFloat(hookData.cell.raw);
        if (val < 75) {
          hookData.cell.styles.textColor = [220, 38, 38];
          hookData.cell.styles.fontStyle = "bold";
        } else {
          hookData.cell.styles.textColor = [5, 150, 105];
          hookData.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  const fileName = `${group}_${yearOfStudy}_${monthLabel.replace(" ", "_")}_Attendance.pdf`;
  doc.save(fileName);
}

  return (
    <div className="mx-auto mt-24 max-w-7xl px-3 pb-10 sm:px-4">
      <div className="mb-4 rounded-3xl border border-slate-200 bg-linear-to-br from-white via-sky-50 to-cyan-100 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.25em] text-cyan-700 uppercase">
              Attendance Calendar
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {collegeName || 'Your College'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-white/80 px-3 py-1 font-semibold shadow-sm">
                {monthLabel}
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white shadow-sm">
                {selectedStudent ? selectedStudent.name : 'Select student'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[300px]">
            {[
              {
                value: presentCount,
                label: 'Present',
                tone: 'bg-emerald-100 text-emerald-800',
              },
              {
                value: absentCount,
                label: 'Absent',
                tone: 'bg-rose-100 text-rose-800',
              },
              {
                value: `${attendancePercentage}%`,
                label: 'Attendance',
                tone: 'bg-sky-100 text-sky-800',
              },
            ].map(item => (
              <div key={item.label} className={`rounded-2xl px-3 py-2 shadow-sm ${item.tone}`}>
                <p className="text-lg leading-none font-black">{item.value}</p>
                <p className="mt-1 text-[11px] font-semibold tracking-wide uppercase">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 mb-4 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
          <button
            type="button"
            onClick={() => changeMonthBy(-1)}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            {'< Prev'}
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
              Current View
            </p>
            <p className="text-sm font-black text-slate-900 sm:text-base">{monthLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => changeMonthBy(1)}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            {'Next >'}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={yearOfStudy}
            onChange={e => setYearOfStudy(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition outline-none focus:border-cyan-400 focus:bg-white"
          >
            <option value="">Select Year</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
          </select>

          <select
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition outline-none focus:border-cyan-400 focus:bg-white"
          >
            <option value="">Select Group</option>
            {groupsList.map(groupName => (
              <option key={groupName} value={groupName}>
                {groupName}
              </option>
            ))}
          </select>

          <select
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition outline-none focus:border-cyan-400 focus:bg-white"
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>

          <select
            value={month}
            onChange={e => setMonth(parseInt(e.target.value, 10))}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition outline-none focus:border-cyan-400 focus:bg-white"
          >
            {monthNames.map((monthName, index) => (
              <option key={monthName} value={index}>
                {monthName}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value, 10))}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition outline-none focus:border-cyan-400 focus:bg-white"
          >
            {[...Array(5)].map((_, index) => {
              const yearValue = new Date().getFullYear() - 2 + index

              return (
                <option key={yearValue} value={yearValue}>
                  {yearValue}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap justify-center gap-3">
  <Link href="/attendance-form">
    <button className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700">
      Attendance Form
    </button>
  </Link>
  <Link href="/attendance-records">
    <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
      Attendance Records
    </button>
  </Link>

  {/* ← ఇది add చేయి */}
  {selectedStudent && (
    <button
      type="button"
      onClick={generatePDF}
      className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
    >
      ⬇ Download PDF
    </button>
  )}
  {group && yearOfStudy && (
  <button
    type="button"
    onClick={generateClassPDF}
    className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
  >
    ⬇ Class PDF
  </button>
)}
</div>

      {selectedStudent && (
        <div className="mb-4 grid gap-4 xl:grid-cols-[1.4fr_2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {selectedStudent?.photo ? (
                <Image
                  src={selectedStudent.photo}
                  alt="Student"
                  width={72}
                  height={72}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100"
                  unoptimized
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-xl font-black text-slate-600">
                  {selectedStudent.name?.[0] || 'S'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Student
                </p>
                <p className="truncate text-lg font-black text-slate-900">{selectedStudent.name}</p>
                {joinDateObj && (
                  <p className="mt-1 text-sm text-slate-500">
                    Joined on {joinDateObj.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Working Days
                </p>
                <p className="mt-1 text-lg font-black text-slate-800">{workingDays}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Pending / N-A
                </p>
                <p className="mt-1 text-lg font-black text-slate-800">{naCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <p className="text-sm font-bold text-slate-900">Monthly Snapshot</p>
              <p className="text-xs text-slate-500">Quick totals for the selected month</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                {
                  value: presentCount,
                  label: 'Present',
                  color: 'bg-emerald-100 text-emerald-800',
                  icon: 'P',
                },
                {
                  value: absentCount,
                  label: 'Absent',
                  color: 'bg-rose-100 text-rose-800',
                  icon: 'A',
                },
                {
                  value: naCount,
                  label: 'N/A',
                  color: 'bg-slate-100 text-slate-700',
                  icon: 'N',
                },
                {
                  value: workingDays,
                  label: 'Working',
                  color: 'bg-amber-100 text-amber-800',
                  icon: 'W',
                },
                {
                  value: `${attendancePercentage}%`,
                  label: 'Attend',
                  color: 'bg-sky-100 text-sky-800',
                  icon: '%',
                },
              ].map((card, index) => (
                <motion.div
                  key={card.label}
                  className={`rounded-2xl px-3 py-3 shadow-sm ${card.color}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black tracking-[0.2em] uppercase">
                      {card.icon}
                    </span>
                    <p className="text-xl leading-none font-black">{card.value}</p>
                  </div>
                  <p className="mt-2 text-xs font-semibold tracking-wide uppercase">{card.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">{monthLabel}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {daysInMonth} days
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Compact calendar view with attendance highlights
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { label: 'Present', tone: 'present' },
              { label: 'Absent', tone: 'absent' },
              { label: 'Holiday', tone: 'holiday' },
              { label: 'Weekend', tone: 'weekend' },
              { label: 'Before Join', tone: 'beforeJoin' },
            ].map(item => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-700"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${statusTheme[item.tone].dot}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {selectedStudent && (
          <div className="grid gap-2 border-b border-slate-100 px-4 py-3 md:grid-cols-5">
            {weeklySummary.map(week => (
              <div key={week.label} className="rounded-2xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                  {week.label}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                    P {week.present}
                  </span>
                  <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">
                    A {week.absent}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                    Off {week.holidays}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-7 gap-px bg-slate-200 p-px">
          {weekDayNames.map(dayName => (
            <div
              key={dayName}
              className="bg-slate-900 px-2 py-2 text-center text-[11px] font-bold tracking-[0.2em] text-white uppercase sm:text-xs"
            >
              {dayName}
            </div>
          ))}

          {calendarCells.map(cell => {
            if (cell.empty) {
              return <div key={cell.key} className="min-h-[74px] bg-slate-50 sm:min-h-28" />
            }

            const theme = statusTheme[cell.tone]
            const showAttendanceContent =
              !cell.holiday && !cell.sunday && !cell.secondSaturday && cell.status !== 'Before Join'

            return (
              <div
                key={cell.key}
                className={`min-h-[74px] border p-1.5 transition sm:min-h-28 sm:p-3 ${theme.cell}`}
                title={cell.status}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm leading-none font-black sm:text-lg">{cell.date}</p>
                    <p className="mt-1 text-[10px] tracking-wide uppercase opacity-70">
                      {weekDayNames[cell.currentDate.getDay()]}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold tracking-wide uppercase sm:text-[10px] ${theme.badge}`}
                  >
                    {cell.status === 'Present'
                      ? 'P'
                      : cell.status === 'Absent'
                        ? 'A'
                        : cell.holiday
                          ? 'H'
                          : cell.status === 'Before Join'
                            ? 'BJ'
                            : 'W'}
                  </span>
                </div>

                <div className="mt-1.5 space-y-1 text-[9px] sm:mt-2 sm:text-xs">
                  {cell.holiday && (
                    <p className="line-clamp-2 font-semibold">{cell.holiday.name}</p>
                  )}
                  {cell.sunday && !cell.holiday && <p className="font-semibold">Sunday</p>}
                  {cell.secondSaturday && !cell.holiday && (
                    <p className="font-semibold">2nd Saturday</p>
                  )}
                  {cell.status === 'Before Join' && <p className="font-semibold">Before Join</p>}

                  {showAttendanceContent &&
                    (cell.status === 'Present' ? (
                      <div className="flex items-center gap-2">
                        {selectedStudent?.photo && (
                          <Image
                            src={selectedStudent.photo}
                            alt="Student"
                            width={36}
                            height={36}
                            className="h-7 w-7 rounded-lg object-cover ring-1 ring-white/70 sm:h-9 sm:w-9 sm:rounded-xl"
                            unoptimized
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold">Present</p>
                          <p className="truncate text-[10px] opacity-75">{selectedStudent?.name}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold">{cell.status}</p>

                        {cell.status === 'Absent' &&
                          selectedStudent?._id &&
                          (() => {
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                              cell.date
                            ).padStart(2, '0')}`
                            const hasReason = !!reasonMap[dateStr]

                            return (
                              <Link
                                href={`/attendance-records/${selectedStudent._id}/absent-reason?date=${dateStr}`}
                              >
                                <button
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition hover:bg-white ${
                                    hasReason
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-white/80 text-blue-700'
                                  }`}
                                >
                                  {hasReason ? '🟢✓ Reason Added' : '🔵View Reason'}
                                </button>
                              </Link>
                            )
                          })()}
                      </>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
