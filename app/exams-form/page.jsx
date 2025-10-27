"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  School,
  FileCheck2,
  CalendarClock,
  ClipboardSignature,
  Users2,
  BookKey,
  FilePenLine,
  Inbox,
} from "lucide-react";

export default function ExamsFormPage() {
  const [students, setStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [group, setGroup] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    stream: "",
    yearOfStudy: "",
    academicYear: "",
    examType: "",
    examDate: "",
    subjects: {},
    total: 0,
    percentage: 0,
  });

  const router = useRouter();
  const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
  const vocationalStreams = ["M&AT", "CET", "MLT"];

  const { data: session } = useSession();
  const [collegeId, setCollegeId] = useState('');
  const [collegeName, setCollegeName] = useState('');

  useEffect(() => {
    if (session?.user?.collegeId) setCollegeId(session.user.collegeId);
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `/api/students?collegeId=${session?.user?.collegeId}&group=${group}`
        );
        const json = await res.json();
        setStudents(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [group, session?.user?.collegeId]);

  useEffect(() => {
    if (session?.user?.collegeName) {
      document.title = `${session.user.collegeName} - Exam Entry Form`;
    }
  }, [session]);

  const filteredStudents = formData.stream
    ? students.filter(
        (s) => s.group?.toLowerCase() === formData.stream.toLowerCase()
      )
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "studentId") {
      const selectedStudent = students.find((s) => s._id === value);
      setFormData((prev) => ({
        ...prev,
        studentId: value,
        yearOfStudy: selectedStudent?.yearOfStudy || "",
      }));
      return;
    }
    if (name.startsWith("subject_")) {
      const subjectKey = name.replace("subject_", "");
      const subjectValue = value.toUpperCase().trim();
      setFormData((prev) => {
        const updatedSubjects = {
          ...prev.subjects,
          [subjectKey]:
            subjectValue === "A" || subjectValue === "AB"
              ? subjectValue
              : isNaN(Number(subjectValue))
              ? ""
              : Number(subjectValue),
        };
        const subjectMarks = Object.values(updatedSubjects);
        const validMarks = subjectMarks.filter(
          (v) => typeof v === "number" && !isNaN(v)
        );
        const totalMarks = validMarks.reduce((sum, val) => sum + val, 0);
        const percent =
          validMarks.length > 0
            ? parseFloat((totalMarks / validMarks.length).toFixed(2))
            : 0;
        return {
          ...prev,
          subjects: updatedSubjects,
          total: totalMarks,
          percentage: percent,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          collegeId: session?.user?.collegeId,
          lecturerId: session?.user?.id,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("✅ Exam saved successfully!");
        router.push("/exams-form"); // ✅ redirect here
        setFormData({
          yearOfStudy: "",
          academicYear: "",
          studentId: "",
          stream: "",
          examType: "",
          examDate: "",
          subjects: {},
          total: 0,
          percentage: 0,
        });
      } else {
        toast.error(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      toast.error("❌ Server error while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectsToRender = useMemo(() => {
    if (!formData.stream) return [];
    if (generalStreams.includes(formData.stream)) {
      return [
        "Telugu/Sanskrit",
        "English",
        "Maths/Botany/Civics",
        "Maths/Zoology/History",
        "Physics/Economics",
        "Chemistry/Commerce",
      ];
    }
    if (vocationalStreams.includes(formData.stream)) {
      return ["GFC", "English", "V1/V4", "V2/V5", "V3/V6"];
    }
    return [];
  }, [formData.stream]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-4">
      <Toaster />
      {isSubmitting && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-blue-700 font-bold text-xl animate-pulse flex items-center gap-2">
            <FileCheck2 className="w-8 h-8 animate-spin" /> Saving Exam Data...
          </div>
        </div>
      )}

      {/* College AppBar */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-green-50 px-6 py-3 font-extrabold text-blue-900 text-xl shadow-xl">
          <School className="w-8 h-8 text-indigo-700" />
          <span className="tracking-wider">{collegeName}</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 bg-white shadow-2xl rounded-2xl z-10">
        <div className="mb-4 flex gap-3">
          <Link href="/exam-report">
            <button className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition flex gap-1 items-center">
              <ClipboardSignature /> Exam Report
            </button>
          </Link>
          <Link href="/exams-form">
            <button className="bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-indigo-800 transition flex gap-1 items-center">
              <FilePenLine /> New Entry (Reset)
            </button>
          </Link>
        </div>

        <h2 className="text-xl font-extrabold mb-4 flex items-center justify-center bg-gradient-to-r from-indigo-100 via-emerald-50 to-purple-100 text-blue-900 rounded-2xl py-2 shadow gap-2">
          <Inbox className="w-6 h-6 text-cyan-800" />
          Subjectwise Exam Marks Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div>
            <label className="flex items-center gap-2 font-semibold">
              <BookKey className="w-5 h-5 text-blue-800" /> Stream
            </label>
            <select
              name="stream"
              value={formData.stream}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Stream --</option>
              {[...generalStreams, ...vocationalStreams].map((stream) => (
                <option key={stream} value={stream}>
                  {stream}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold">
              <Users2 className="w-5 h-5 text-lime-700" /> Student
            </label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={!formData.stream}
            >
              <option value="">
                {formData.stream
                  ? "-- Select Student --"
                  : "-- Select Stream First --"}
              </option>
              {filteredStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {formData.yearOfStudy && (
            <div className="text-blue-600 font-semibold">
              <span className="inline-block"><CalendarClock className="w-5 h-5 inline mr-1" /></span>
              Year of Study: {formData.yearOfStudy}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 font-semibold">
              <BookKey className="w-5 h-5 text-purple-700" /> Academic Year
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Year --</option>
              <option value="2025-1">First Year</option>
              <option value="2025-2">Second Year</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold">
              <BookKey className="w-5 h-5 text-amber-700" /> Exam Type
            </label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Exam Type --</option>
              {[
                "UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4",
                "QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2"
              ].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold">
              <CalendarClock className="w-5 h-5 text-orange-700" /> Exam Date
            </label>
            <input
              type="date"
              name="examDate"
              value={formData.examDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-2 gap-2">
            {subjectsToRender.map((subject) => (
              <input
                key={subject}
                type="text"
                name={`subject_${subject}`}
                placeholder={`Enter ${subject} marks`}
                value={
                  formData.subjects[subject] === 0 ||
                  formData.subjects[subject] === "0"
                    ? "0"
                    : formData.subjects[subject] || ""
                }
                onChange={handleChange}
                className="border p-2 rounded"
              />
            ))}
          </div>

          {/* Display total and percentage */}
          <div className="flex gap-4 mt-4">
            <div className="font-semibold text-slate-700 bg-slate-100 rounded px-2 py-1">
              <span className="font-bold text-cyan-700">Total: </span>
              {formData.total}&nbsp;marks
            </div>
            <div className="font-semibold text-slate-700 bg-slate-100 rounded px-2 py-1">
              <span className="font-bold text-lime-700">%</span>
              {formData.percentage}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-green-800 via-blue-900 to-indigo-800 py-2 text-lg font-bold text-white shadow hover:bg-blue-700 transition"
          >
            <FileCheck2 className="w-6 h-6" /> Save Exam Marks
          </button>
        </form>
      </div>
    </div>
  );
}
