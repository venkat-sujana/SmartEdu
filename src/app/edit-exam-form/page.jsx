// app/edit-exam-form/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

const GENERAL_STREAMS = ["MPC", "BIPC", "CEC", "HEC"];
const UNIT_EXAMS = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"];

function generateAcademicYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push({ value: `${y}-1`, label: `First Year (${y})` });
    years.push({ value: `${y}-2`, label: `Second Year (${y})` });
  }
  return years;
}

export default function EditExamForm({ examData, onClose, onUpdated }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    _id: "",
    stream: "",
    studentId: "",
    academicYear: "",
    examType: "",
    examDate: "",
    yearOfStudy: "",
    subjects: {},
    total: 0,
    percentage: 0,
  });

  const examId = examData?._id;

  // stream బట్టి subject keys decide అవుతాయి
  const subjectKeys = useMemo(() => {
    if (!formData.stream) return [];
    return GENERAL_STREAMS.includes(formData.stream)
      ? [
          "Telugu/Sanskrit/Hindi",
          "English",
          "Maths/Botany/Civics",
          "Maths/Zoology/History",
          "Physics/Economics",
          "Chemistry/Commerce",
        ]
      : ["GFC", "English", "V1/V4", "V2/V5", "V3/V6"];
  }, [formData.stream]);

  const academicYearOptions = useMemo(() => generateAcademicYearOptions(), []);

  useEffect(() => {
    // Students list fetch
    const fetchStudents = async () => {
      if (!session?.user?.collegeId) return;
      const res = await fetch(`/api/students`);
      const json = await res.json();
      setStudents(json.data || []);
    };
    fetchStudents();

    if (examData) {
      // ✅ FIX: generalSubjects [] empty array అయినా truthy — length చెక్ చేయాలి
      const rawSubjects = examData.generalSubjects?.length
        ? examData.generalSubjects
        : examData.vocationalSubjects || [];

      // ✅ Array [{subject, marks, maxMarks}] → Object {"GFC": 20} గా convert
      const subjectsObj = Array.isArray(rawSubjects)
        ? rawSubjects.reduce((acc, s) => {
            if (s?.subject) acc[s.subject] = s.marks ?? "";
            return acc;
          }, {})
        : rawSubjects;

      // ✅ studentId populated object గా వస్తే _id తీసుకోవాలి
      const studentIdValue =
        typeof examData.studentId === "object"
          ? examData.studentId?._id || ""
          : examData.studentId || "";

      setFormData({
        _id: examData._id || "",
        stream: examData.stream || "",
        studentId: studentIdValue,
        yearOfStudy: examData.yearOfStudy || "",
        academicYear: examData.academicYear || "",
        examType: examData.examType || "",
        examDate: examData.examDate?.substring(0, 10) || "",
        subjects: subjectsObj,
        total: examData.total || 0,
        percentage: examData.percentage || 0,
      });
    }
  }, [examData, session]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("subject_")) {
      const subject = name.replace("subject_", "");
      const subjectValue = value.toUpperCase().trim();

      setFormData((prev) => {
        const updatedSubjects = {
          ...prev.subjects,
          [subject]:
            subjectValue === "A" || subjectValue === "AB"
              ? subjectValue
              : isNaN(Number(subjectValue))
              ? ""
              : Number(subjectValue),
        };

        const validMarks = Object.values(updatedSubjects).filter(
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
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!examId) {
      toast.error("❌ Exam ID missing");
      setLoading(false);
      return;
    }

    if (!formData.studentId || formData.studentId.length !== 24) {
      toast.error("❌ Please select a valid student");
      setLoading(false);
      return;
    }

    // ✅ FIX: examType బట్టి maxMarks set చేయాలి
    const maxMarks = UNIT_EXAMS.includes(formData.examType) ? 25 : 50;

    // ✅ FIX: Object {"GFC": 20} → Array [{subject, marks, maxMarks}] గా convert చేసి పంపాలి
    const subjectsArray = Object.entries(formData.subjects)
      .filter(([, marks]) => marks !== "" && marks !== undefined)
      .map(([subject, marks]) => ({ subject, marks, maxMarks }));

    const payload = {
      studentId: formData.studentId,
      stream: formData.stream,
      examType: formData.examType,
      examDate: formData.examDate,
      academicYear: formData.academicYear,
      yearOfStudy: formData.yearOfStudy,
      total: formData.total,
      percentage: formData.percentage,
      ...(GENERAL_STREAMS.includes(formData.stream)
        ? { generalSubjects: subjectsArray, vocationalSubjects: [] }
        : { vocationalSubjects: subjectsArray, generalSubjects: [] }),
    };

    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        throw new Error(result.message || "❌ Failed to update exam");
      }

      toast.success("✅ Exam updated successfully!");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-lg max-w-xl mx-auto relative">
      <Toaster />
      <h2 className="text-xl font-bold mb-4 text-center">Edit Exam Entry</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Student */}
        <div>
          <label className="block font-medium">Student Name</label>
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Select Student --</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block font-medium">Academic Year</label>
          <select
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Year --</option>
            {formData.academicYear &&
              !academicYearOptions.find(
                (o) => o.value === formData.academicYear
              ) && (
                <option value={formData.academicYear}>
                  {formData.academicYear}
                </option>
              )}
            {academicYearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Type */}
        <div>
          <label className="block font-medium">Exam Type</label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {[
              "UNIT-1","UNIT-2","UNIT-3","UNIT-4",
              "QUARTERLY","HALFYEARLY","PRE-PUBLIC-1","PRE-PUBLIC-2",
            ].map((exam) => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
        </div>

        {/* Exam Date */}
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

        {/* Subjects */}
        {subjectKeys.length > 0 ? (
          <div>
            <label className="block font-medium mb-1">Subject Marks</label>
            <div className="grid grid-cols-2 gap-2">
              {subjectKeys.map((subj) => (
                <div key={subj}>
                  <label className="block text-xs text-gray-500 mb-0.5">
                    {subj}
                  </label>
                  <input
                    type="text"
                    name={`subject_${subj}`}
                    placeholder={subj}
                    value={formData.subjects[subj] ?? ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Stream select చేయబడలేదు — subjects load కావడం లేదు.
          </p>
        )}

        {/* Total & Percentage (readonly) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500">Total Marks</label>
            <input
              type="text"
              value={formData.total}
              readOnly
              className="border p-2 rounded w-full bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Percentage</label>
            <input
              type="text"
              value={formData.percentage}
              readOnly
              className="border p-2 rounded w-full bg-gray-50 text-gray-600"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}