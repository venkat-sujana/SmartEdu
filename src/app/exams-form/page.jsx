//app/exams-form/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import ExamsForm from "@/components/exams/ExamsForm";

const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
const unitExams = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"];
const publicExams = ["QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2"];

function buildSubjectPayload(subjects, examType) {
  const maxMarks = unitExams.includes(examType)
    ? 25
    : publicExams.includes(examType)
      ? 50
      : 100;

  return Object.entries(subjects)
    .filter(([, marks]) => marks !== "" && marks !== null && marks !== undefined)
    .map(([subject, marks]) => ({
      subject,
      marks: marks === "A" || marks === "AB" ? 0 : Number(marks),
      maxMarks,
    }))
    .filter((item) => Number.isFinite(item.marks));
}

export default function ExamsFormPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const collegeName = session?.user?.collegeName || "";

  // Fetch students based on selected stream/year
  useEffect(() => {
    const fetchStudents = async () => {
      if (!session?.user?.collegeId || !formData.stream) {
        setStudents([]);
        return;
      }

      const yearOfStudy = formData.academicYear
        ? formData.academicYear.endsWith("-1")
          ? "First Year"
          : "Second Year"
        : "";

      try {
        const params = new URLSearchParams({
          group: formData.stream,
          limit: "100",
        });

        if (yearOfStudy) {
          params.set("yearOfStudy", yearOfStudy);
        }

        const res = await fetch(`/api/students?${params.toString()}`);
        const json = await res.json();
        setStudents(Array.isArray(json.data) ? json.data : []);
      } catch {
        setStudents([]);
      }
    };

    fetchStudents();
  }, [formData.stream, formData.academicYear, session?.user?.collegeId]);




  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const subjectPayload = buildSubjectPayload(formData.subjects, formData.examType);
      const isGeneralStream = generalStreams.includes(formData.stream);

      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          generalSubjects: isGeneralStream ? subjectPayload : undefined,
          vocationalSubjects: isGeneralStream ? undefined : subjectPayload,
          collegeId: session?.user?.collegeId,
          lecturerId: session?.user?.id,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ Exam saved successfully!");
        router.push("/exam-report");
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
    } catch {
      toast.error("❌ Server error while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      <ExamsForm
        collegeName={collegeName}
        students={students}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </>
  );
}
