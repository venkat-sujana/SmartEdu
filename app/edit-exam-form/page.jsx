// app/components/EditExamForm.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function EditExamForm({ examData, onClose, onUpdated }) {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
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

  const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
  const vocationalStreams = ["M&AT", "CET", "MLT"];

  const subjectKeys = useMemo(() => {
    if (!formData.stream) return [];
    return generalStreams.includes(formData.stream)
      ? [
          "Telugu/Sanskrit",
          "English",
          "Maths/Botany/Civics",
          "Maths/Zoology/History",
          "Physics/Economics",
          "Chemistry/Commerce",
        ]
      : ["GFC", "English", "V1/V4", "V2/V5", "V3/V6"];
  }, [formData.stream]);

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch("/api/students");
      const json = await res.json();
      setStudents(json.data || []);
    };
   
    fetchStudents();

    if (examData) {
       const examId = examData._id;
  console.log("Updating Exam ID:", examId); // ✅ correct ID

      setFormData({
        _id: examData._id,
        stream: examData.stream,
        studentId: examData.student?._id || "",
        yearOfStudy: examData.yearOfStudy,
        academicYear: examData.academicYear,
        examType: examData.examType,
        examDate: examData.examDate?.substring(0, 10),
        subjects:
          examData.generalSubjects || examData.vocationalSubjects || {},
        total: examData.total || 0,
        percentage: examData.percentage || 0,
      });
    }
  }, [examData]);

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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };




const handleUpdate = async (e) => {
  e.preventDefault();

  if (!formData.studentId || formData.studentId.length !== 24) {
    toast.error("❌ Please select a valid student");
    return;
  }

  const payload = {
    studentId: formData.studentId,
    stream: formData.stream,
    examType: formData.examType,
    examDate: formData.examDate,
    academicYear: formData.academicYear,
    yearOfStudy: formData.yearOfStudy,
    total: formData.total,
    percentage: formData.percentage,
    [generalStreams.includes(formData.stream)
      ? "generalSubjects"
      : "vocationalSubjects"]: formData.subjects,
  };

  try {
    const res = await fetch(`/api/exams/${formData._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("Update result:", result);

if (res.ok && result.success !== false) {
  toast.success("✅ Exam updated successfully!");
  setFormData({
    ...formData,
    ...result.data,
    subjects:
      result.data.generalSubjects || result.data.vocationalSubjects || {},
  });
  onUpdated(); // reload or refresh parent if needed
  onClose(); // ✅ close the form directly here
}
    if (!res.ok || result.success === false) {
      throw new Error(result.message || "❌ Failed to update exam");
    }
    } catch (error) {
    console.error("❌ Update error:", error);
    toast.error(error.message);
  }
};


  return (
    <div className="bg-white border rounded p-4 shadow max-w-xl mx-auto">
      <Toaster />
      <h2 className="text-xl font-bold mb-4 text-center">Edit Exam Entry</h2>

      <form onSubmit={handleUpdate} className="space-y-4">

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
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {subjectKeys.map((subj) => (
            <input
              key={subj}
              type="text"
              name={`subject_${subj}`}
              placeholder={subj}
              value={formData.subjects[subj] ?? ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          ))}
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          >
            Update
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
