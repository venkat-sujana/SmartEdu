//src/

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import ExamsForm from "@/components/exams/ExamsForm";
import { getDashboardRouteForLecturerSubject } from "@/utils/lecturerDashboardRoute";

const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
const unitExams = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"];
const publicExams = ["QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2"];
const validYearsOfStudy = ["First Year", "Second Year"];

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
      marks: marks === "A" || marks === "AB" ? marks : Number(marks),
      maxMarks,
    }))
    .filter(
      (item) =>
        item.marks === "A" ||
        item.marks === "AB" ||
        Number.isFinite(item.marks)
    );
}

function hasEnteredMarks(subjects) {
  return Object.values(subjects || {}).some(
    (mark) => mark !== "" && mark !== null && mark !== undefined
  );
}

function deriveYearOfStudy(academicYear) {
  if (!academicYear) return "";
  return academicYear.endsWith("-1") ? "First Year" : "Second Year";
}

function isValidYearOfStudy(yearOfStudy) {
  return validYearsOfStudy.includes(yearOfStudy);
}

export default function ExamsFormPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const dashboardReturnUrl =
    searchParams.get("returnUrl") ||
    (session?.user?.role === "lecturer"
      ? getDashboardRouteForLecturerSubject(session.user.subject)
      : "/exam-report");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!session?.user?.collegeId || !formData.stream) {
        setStudents([]);
        return;
      }

      const yearOfStudy = deriveYearOfStudy(formData.academicYear);

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

  const resetForm = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resolvedYearOfStudy =
      formData.yearOfStudy || deriveYearOfStudy(formData.academicYear);

    if (!formData.studentId) {
      toast.error("Please select a student.");
      return;
    }

    if (!isValidYearOfStudy(resolvedYearOfStudy)) {
      toast.error("Please select a valid academic year.");
      return;
    }

    setIsSubmitting(true);

    try {
      const subjectPayload = buildSubjectPayload(formData.subjects, formData.examType);
      const isGeneralStream = generalStreams.includes(formData.stream);

      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          yearOfStudy: resolvedYearOfStudy,
          generalSubjects: isGeneralStream ? subjectPayload : undefined,
          vocationalSubjects: isGeneralStream ? undefined : subjectPayload,
          collegeId: session?.user?.collegeId,
          lecturerId: session?.user?.id,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Exam saved successfully!");
        router.push(dashboardReturnUrl);
        resetForm();
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch {
      toast.error("Server error while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async ({ bulkMarks, students: bulkStudents, yearOfStudy }) => {
    if (!formData.stream || !formData.academicYear || !formData.examType || !formData.examDate) {
      toast.error("Group, academic year, exam type, and exam date are required.");
      return;
    }

    const resolvedYearOfStudy = yearOfStudy || deriveYearOfStudy(formData.academicYear);

    if (!isValidYearOfStudy(resolvedYearOfStudy)) {
      toast.error("Please select a valid academic year.");
      return;
    }

    const rowsToSave = bulkStudents
      .map((student) => ({
        student,
        subjects: bulkMarks?.[student._id] || {},
      }))
      .filter((row) => {
        const studentYear = row.student?.yearOfStudy || resolvedYearOfStudy;
        return row.student?._id && isValidYearOfStudy(studentYear) && hasEnteredMarks(row.subjects);
      });

    if (rowsToSave.length === 0) {
      toast.error("Enter marks for at least one valid student.");
      return;
    }

    setIsSubmitting(true);

    try {
      const isGeneralStream = generalStreams.includes(formData.stream);
      let savedCount = 0;

      for (const row of rowsToSave) {
        const subjectPayload = buildSubjectPayload(row.subjects, formData.examType);

        if (subjectPayload.length === 0) {
          continue;
        }

        const payload = {
          studentId: row.student._id,
          stream: formData.stream,
          yearOfStudy: row.student.yearOfStudy || resolvedYearOfStudy,
          academicYear: formData.academicYear,
          examType: formData.examType,
          examDate: formData.examDate,
          generalSubjects: isGeneralStream ? subjectPayload : undefined,
          vocationalSubjects: isGeneralStream ? undefined : subjectPayload,
          collegeId: session?.user?.collegeId,
          lecturerId: session?.user?.id,
        };

        const res = await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok || result?.success === false) {
          throw new Error(result?.message || `${row.student.name} save failed`);
        }

        savedCount += 1;
      }

      if (savedCount === 0) {
        toast.error("No valid rows found to save.");
        return;
      }

      toast.success(`${savedCount} students marks saved successfully!`);
      router.push(dashboardReturnUrl);
      resetForm();
    } catch (error) {
      toast.error(error.message || "Bulk save failed");
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
        onBulkSubmit={handleBulkSubmit}
        dashboardReturnUrl={dashboardReturnUrl}
      />
    </>
  );
}
