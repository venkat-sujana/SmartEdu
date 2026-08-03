"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

const GENERAL_STREAMS = ["MPC", "BIPC", "CEC", "HEC"];
const UNIT_EXAMS = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"];

function isAbsentMark(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return normalized === "A" || normalized === "AB";
}

function generateAcademicYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push({ value: `${y}-1`, label: `First Year (${y})` });
    years.push({ value: `${y}-2`, label: `Second Year (${y})` });
  }

  return years;
}

function normalizeGroup(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function deriveYearOfStudy(academicYear) {
  if (!academicYear) return "";
  return academicYear.endsWith("-1") ? "First Year" : "Second Year";
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

  const selectedYearOfStudy = formData.academicYear
    ? deriveYearOfStudy(formData.academicYear)
    : formData.yearOfStudy;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const sameGroup = formData.stream
        ? normalizeGroup(student.group) === normalizeGroup(formData.stream)
        : true;
      const sameYear = selectedYearOfStudy
        ? student.yearOfStudy === selectedYearOfStudy
        : true;

      return sameGroup && sameYear;
    });
  }, [students, formData.stream, selectedYearOfStudy]);

  useEffect(() => {
    if (!examData) return;

    const rawSubjects = examData.generalSubjects?.length
      ? examData.generalSubjects
      : examData.vocationalSubjects || [];

    const subjectsObj = Array.isArray(rawSubjects)
      ? rawSubjects.reduce((acc, subject) => {
          if (subject?.subject) {
            acc[subject.subject] = subject.marks ?? "";
          }
          return acc;
        }, {})
      : rawSubjects;

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
  }, [examData]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!session?.user?.collegeId) return;

      try {
        const params = new URLSearchParams({ limit: "100" });

        if (formData.stream) {
          params.set("group", formData.stream);
        }

        if (selectedYearOfStudy) {
          params.set("yearOfStudy", selectedYearOfStudy);
        }

        const res = await fetch(`/api/students?${params.toString()}`);
        const json = await res.json();
        setStudents(Array.isArray(json.data) ? json.data : []);
      } catch {
        setStudents([]);
      }
    };

    fetchStudents();
  }, [session?.user?.collegeId, formData.stream, selectedYearOfStudy]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("subject_")) {
      const subject = name.replace("subject_", "");
      const subjectValue = value.toUpperCase().trim();

      setFormData((prev) => {
        const updatedSubjects = {
          ...prev.subjects,
          [subject]:
            isAbsentMark(subjectValue)
              ? subjectValue
              : Number.isNaN(Number(subjectValue))
              ? ""
              : Number(subjectValue),
        };

        const validMarks = Object.values(updatedSubjects).filter(
          (mark) => typeof mark === "number" && !Number.isNaN(mark)
        );
        const totalMarks = validMarks.reduce((sum, mark) => sum + mark, 0);
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

      return;
    }

    if (name === "studentId") {
      const selectedStudent = students.find((student) => student._id === value);
      setFormData((prev) => ({
        ...prev,
        studentId: value,
        yearOfStudy: selectedStudent?.yearOfStudy || prev.yearOfStudy,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "academicYear"
        ? { yearOfStudy: deriveYearOfStudy(value), studentId: "" }
        : {}),
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!examId) {
      toast.error("Exam ID missing");
      setLoading(false);
      return;
    }

    if (!formData.studentId || formData.studentId.length !== 24) {
      toast.error("Please select a valid student");
      setLoading(false);
      return;
    }

    const maxMarks = UNIT_EXAMS.includes(formData.examType) ? 25 : 50;
    const subjectsArray = Object.entries(formData.subjects)
      .filter(([, marks]) => marks !== "" && marks !== undefined)
      .map(([subject, marks]) => ({
        subject,
        marks: isAbsentMark(marks) ? String(marks).trim().toUpperCase() : marks,
        maxMarks,
      }));

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
        throw new Error(result.message || "Failed to update exam");
      }

      toast.success("Exam updated successfully");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-xl rounded-xl border bg-white p-4 shadow-lg">
      <Toaster />
      <h2 className="mb-4 text-center text-xl font-bold">Edit Exam Entry</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block font-medium">Student Name</label>
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          >
            <option value="">-- Select Student --</option>
            {filteredStudents.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
                {student.admissionNo ? ` (${student.admissionNo})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Academic Year</label>
          <select
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className="w-full rounded border p-2"
          >
            <option value="">-- Select Year --</option>
            {formData.academicYear &&
              !academicYearOptions.find((option) => option.value === formData.academicYear) && (
                <option value={formData.academicYear}>{formData.academicYear}</option>
              )}
            {academicYearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Exam Type</label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            className="w-full rounded border p-2"
          >
            {[
              "UNIT-1",
              "UNIT-2",
              "UNIT-3",
              "UNIT-4",
              "QUARTERLY",
              "HALFYEARLY",
              "PRE-PUBLIC-1",
              "PRE-PUBLIC-2",
            ].map((exam) => (
              <option key={exam} value={exam}>
                {exam}
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
            className="w-full rounded border p-2"
          />
        </div>

        {subjectKeys.length > 0 ? (
          <div>
            <label className="mb-1 block font-medium">Subject Marks</label>
            <div className="grid grid-cols-2 gap-2">
              {subjectKeys.map((subject) => (
                <div key={subject}>
                  <label className="mb-0.5 block text-xs text-gray-500">{subject}</label>
                  <input
                    type="text"
                    name={`subject_${subject}`}
                    placeholder={subject}
                    value={formData.subjects[subject] ?? ""}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Stream select చేసిన తర్వాత subjects కనిపిస్తాయి.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500">Total Marks</label>
            <input
              type="text"
              value={formData.total}
              readOnly
              className="w-full rounded border bg-gray-50 p-2 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Percentage</label>
            <input
              type="text"
              value={formData.percentage}
              readOnly
              className="w-full rounded border bg-gray-50 p-2 text-gray-600"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
