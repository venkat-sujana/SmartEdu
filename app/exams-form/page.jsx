//app/exams-form/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import ExamsForm from "@/app/components/ExamsForm";

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

  // Fetch students based on selected stream
useEffect(() => {
  const fetchStudents = async () => {
    if (!session?.user?.collegeId || !formData.stream) {
      setStudents([]);
      return;
    }
    try {
      const res = await fetch(`/api/students?group=${encodeURIComponent(formData.stream)}`
);

      const json = await res.json();
      setStudents(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setStudents([]);
    }
  };
  fetchStudents();
}, [formData.stream, session?.user?.collegeId]);




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
        router.push("/exams-form");
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
