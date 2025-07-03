//app/exams-form/page.jsx
"use client";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ExamsFormPage() {
  const [students, setStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const [group, setGroup] = useState("");
  const [status, setStatus] = useState(""); // ✅ ఇది అవసరం
  const [result, setResult] = useState({}); // ✅ ఇది అవసరం
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

  const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
  const vocationalStreams = ["M&AT", "CET", "MLT"];

  const generalSubjects = [
    "Tel/Sansk",
    "English",
    "Math/Bot/Civ",
    "Math/Zoo/His",
    "Phy/Eco",
    "Che/Com",
  ];

  const vocationalSubjects = ["GFC", "Eng", "V1/V4", "V2/V5", "V3/V6"];

  // Define fetchStudents outside so it can be reused
  const fetchStudents = async () => {
    try {
      const res = await fetch(
        `/api/students?collegeId=${session?.user?.collegeId}&group=${group}`
      );
      const json = await res.json();

      // ✅ Fetch success అనుకున్నా check చేసేము
      setStudents(Array.isArray(json.data) ? json.data : []);

      // ✅ ఈ logicకి క్రింద లైన్ suffice:
      setStatus(json.status); // 'success' or 'error' from your backend
    } catch (err) {
      console.error("Error fetching students:", err);
      setStatus("error");
    }
  };
  useEffect(() => {
    fetchStudents();
  }, [group, session?.user?.collegeId]); // ✅ group and collegeId dependancies

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
        yearOfStudy: selectedStudent?.yearOfStudy || "", // ✅ yearOfStudy ను తీసుకుంటున్నాం
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
      // ✅ yearOfStudy, academicYear, examType, examDate, studentId, stream
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
        body: JSON.stringify(formData),
        collegeId: session?.user?.collegeId,
        lecturerId: session?.user?.id, // if needed
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("✅ Exam saved successfully!");
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
      console.error(err);
      toast.error("❌ Server error while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inside your component
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
    <div className="relative min-h-screen bg-gray-100 p-4">
      <Toaster />
      {isSubmitting && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-blue-600 text-xl font-semibold animate-pulse">
            Saving Exam Data...
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto p-4 bg-white shadow rounded relative z-10">
        <Link href="/">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-bold mb-4 cursor-pointer">
            🏠 Home
          </button>
        </Link>

        <h2 className="text-xl font-bold mb-4 flex items-center justify-center">
          Home Exam Marks Entry Form - 2025
        </h2>

        {status === "loading" ? (
          <p className="text-center font-semibold text-gray-600 mb-2">
            Loading College Name...
          </p>
        ) : (
          <h2 className="text-center font-bold text-lg mb-2 uppercase">
            {session?.user?.collegeName || "College Name Not Available"}
          </h2>
        )}

        {formData.yearOfStudy && (
          <div className="text-green-600 font-semibold">
            Year of Study: {formData.yearOfStudy}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Stream</label>
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
            <label className="block font-medium">Student</label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange} // ✅ updated here
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
            <div className="text-green-600 font-semibold">
              Year of Study: {formData.yearOfStudy}
            </div>
          )}

          <div>
            <label className="block font-medium">Academic Year</label>
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
            <label className="block font-medium">Exam Type</label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Exam Type --</option>
              {[
                "UNIT-1",
                "UNIT-2",
                "UNIT-3",
                "UNIT-4",
                "QUARTERLY",
                "HALFYEARLY",
                "PRE-PUBLIC-1",
                "PRE-PUBLIC-2",
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Exam Date</label>
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

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer font-bold w-full"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
