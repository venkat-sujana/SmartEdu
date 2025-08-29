//app/students/[id]/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PulseDots from "@/app/animations/pulse-dots/page";
import {
  Home,
  PenSquare,
  CalendarCheck,
  Printer,
  User,
  Phone,
  MapPin,
  Landmark,
  BadgeIndianRupee,
  GraduationCap,
  Users,
  ClipboardList
} from "lucide-react";

import AttendanceSummaryTable from "@/app/components/StudentMonthlyAttendanceSummary/page";

export default function StudentProfilePage() {
  const params = useParams();
  const id = params.id;
  const { data: session, status } = useSession();

  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "loading" || !id) return;
    if (!session) {
      setError("Unauthorized access");
      return;
    }

    // ✅ Student API కాల్ (collegeId ఫిల్టర్ సర్వర్ లోనే జరుగుతుంది)
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStudent(data.data);
        } else {
          setError(data.message || "Student not found");
        }
      })
      .catch(() => setError("Failed to load student data"));

    // ✅ Exams API కాల్
    fetch(`/api/exams/student/${id}`)
      .then((res) => res.json())
      .then((data) => setExams(data));

    // ✅ Attendance API కాల్
    fetch(`/api/attendance/student/${id}`)
      .then((res) => res.json())
      .then((data) => setAttendance(data.data || []));
  }, [id, session, status]);

  const isGeneral = (group) => ["MPC", "BiPC", "CEC", "HEC"].includes(group);
  const isVocational = (group) => ["M&AT", "MLT", "CET"].includes(group);

  const getMaxMarks = (examType, streamType) => {
    if (!examType) return 0;
    const type = examType.toLowerCase();
    if (["unit-1", "unit-2", "unit-3", "unit-4"].includes(type)) return 25;
    if (["quarterly", "half-yearly", "halfyearly"].includes(type)) return 50;
    if (["pre-public-1", "pre-public-2"].includes(type)) {
      return streamType === "general" ? 100 : 50;
    }
    return 0;
  };

  const isFail = (mark, max, stream, examType) => {
    const m = mark === "A" || mark === "AB" ? 0 : Number(mark);
    if (["A", "AB", 0].includes(mark)) return true;

    if (stream === "general") {
      if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(examType)) return m < 9;
      else if (["Quarterly", "Half-Yearly"].includes(examType)) return m < 18;
      else if (["Pre-Public-1", "Pre-Public-2"].includes(examType)) return m < 35;
    } else {
      if (["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"].includes(examType)) return m < 9;
      else return m < 18;
    }
    return false;
  };

  if (status === "loading" || (!student && !error)) return <PulseDots />;

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  const stream = isGeneral(student.group) ? "general" : "vocational";
  const subjectCount = stream === "general" ? 6 : 5;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto text-gray-800">
      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4 print:hidden">
        <Link href="/"><button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"><Home size={18} /> Home</button></Link>
        <Link href="/exams-form"><button className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center gap-2"><PenSquare size={18} /> Exam Form</button></Link>
        <Link href="/attendance-form"><button className="bg-amber-700 text-white px-4 py-2 rounded-md hover:bg-amber-800 flex items-center gap-2"><CalendarCheck size={18} /> Attendance Form</button></Link>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"><Printer size={18} /> Print</button>
      </div>

      {/* Header */}
      <div className="text-center my-4">
        <h1 className="text-2xl font-bold uppercase text-green-700">{session?.user?.collegeName}</h1>
        <p className="italic text-sm text-gray-600">College Address</p>
        <h2 className="font-semibold text-lg mt-1 text-slate-700 uppercase">Care Taker</h2>
      </div>

      {/* Profile */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 text-sm">
          <p><User className="inline mr-1" size={16} /> <strong>Name:</strong> {student.name}</p>
          <p><Users className="inline mr-1" size={16} /> <strong>Father:</strong> {student.fatherName}</p>
          <p><GraduationCap className="inline mr-1" size={16} /> <strong>Group:</strong> {student.group}</p>
          <p><Landmark className="inline mr-1" size={16} /> <strong>Stream:</strong> {stream}</p>
          <p><BadgeIndianRupee className="inline mr-1" size={16} /> <strong>Admission No:</strong> {student.admissionNo}</p>
          <p><Phone className="inline mr-1" size={16} /> <strong>Mobile:</strong> {student.mobile}</p>
          <p><strong>Year:</strong> {student.yearOfStudy}</p>
          <p><strong>Caste:</strong> {student.caste}</p>
          <p><MapPin className="inline mr-1" size={16} /> <strong>Address:</strong> {student.address}</p>
        </div>
        <div className="flex justify-center items-center">
          <img src="/images/apbise.png" alt="Board Logo" className="w-28 h-28 object-contain" />
        </div>
        <div className="flex justify-end">
          <img src={student.photo || "/student-placeholder.png"} alt="Student" className="w-40 h-48 object-cover border rounded-md shadow-sm" />
        </div>
      </div>

      {/* Exam Summary */}
      <h1 className="text-lg font-bold text-slate-800 mb-2"><ClipboardList className="inline mr-1" color="green" size={25} /> Exam Summary</h1>
      {exams.length === 0 ? (
        <p className="text-red-500 text-lg">No exam records available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {exams.map((e, i) => {
            const subjects = e.generalSubjects || e.vocationalSubjects || {};
            const maxMark = getMaxMarks(e.examType, stream);
            const marksArray = Object.values(subjects).map((m) => m === "A" || m === "AB" ? 0 : Number(m));
            const total = marksArray.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
            const percentage = ((total / (subjectCount * maxMark)) * 100).toFixed(2);
            const hasFail = Object.entries(subjects).some(([_, m]) => isFail(m, maxMark, stream, e.examType));

            return (
              <div key={i} className="border rounded-lg p-3 shadow bg-white">
                <h3 className="font-bold text-sm text-blue-700 mb-2">{e.examType}</h3>
                <p><strong>Date:</strong> {new Date(e.examDate).toLocaleDateString()}</p>
                <p><strong>Total:</strong> {total}</p>
                <p><strong>Percentage:</strong> {percentage}%</p>
                <p className={hasFail ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                  {hasFail ? "FAIL" : "PASS"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance Summary */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2 text-slate-700 flex items-center justify-center">📅 Monthly Attendance Summary</h2>
        <AttendanceSummaryTable studentId={id} />
      </div>
    </div>
  );
}
