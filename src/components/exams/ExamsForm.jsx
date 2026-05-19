//app/components/ExamsForm.jsx
"use client";
import { useMemo } from "react";
import {
  ArrowLeft,
  FileCheck2,
  CalendarClock,
  ClipboardSignature,
  Users2,
  BookKey,
  FilePenLine,
  Inbox,
  School,
} from "lucide-react";
import Link from "next/link";

const generalStreams = ["MPC", "BIPC", "CEC", "HEC"];
const vocationalStreams = ["M&AT", "CET", "MLT"];

function normalizeGroup(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

const examTypes = [
  "UNIT-1",
  "UNIT-2",
  "UNIT-3",
  "UNIT-4",
  "QUARTERLY",
  "HALFYEARLY",
  "PRE-PUBLIC-1",
  "PRE-PUBLIC-2",
];

const modernInputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function SectionHeader({ icon: Icon, iconClassName, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className={["rounded-2xl p-2.5 shadow-sm", iconClassName].join(" ")}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function FieldLabel({ icon: Icon, iconClassName, children }) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className={["rounded-xl p-2 shadow-sm", iconClassName].join(" ")}>
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span>{children}</span>
    </label>
  );
}

export default function ExamsForm({
  collegeName,
  students,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  dashboardReturnUrl = "/dashboards",
}) {
const currentYear = new Date().getFullYear();
const academicYearOptions = [
  { value: `${currentYear}-1`, label: `First Year (${currentYear})` },
  { value: `${currentYear}-2`, label: `Second Year (${currentYear})` },
];

const filteredStudents = formData.stream
  ? students.filter((s) => {
      const sameGroup =
        normalizeGroup(s.group) === normalizeGroup(formData.stream);

      if (!formData.academicYear) return sameGroup;

      // academicYear: "2025-1" → "First Year", "2025-2" → "Second Year"
      const selectedYear =
        formData.academicYear.endsWith("-1")
          ? "First Year"
          : "Second Year";

      return (
        sameGroup &&
        s.yearOfStudy?.toLowerCase() === selectedYear.toLowerCase()
      );
    })
  : [];

  const subjectsToRender = useMemo(() => {
    if (!formData.stream) return [];
    if (generalStreams.includes(formData.stream)) {
      return [
        "Telugu/Sanskrit/Hindi",
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
        ...(name === "stream" || name === "academicYear"
          ? { studentId: "", yearOfStudy: "" }
          : {}),
      }));
    }
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_52%,_#f8fafc_100%)] p-4 sm:p-6 lg:p-8">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/95 px-6 py-5 text-lg font-bold text-blue-700 shadow-2xl">
            <FileCheck2 className="h-7 w-7 animate-spin" />
            Saving Exam Data...
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur ring-1 ring-slate-200/60 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg">
                <School className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Examination Module
                </p>
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
                  Subjectwise Marks Entry
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Capture student exam marks, map them to the right academic cycle, and return directly to the lecturer dashboard.
                </p>
                <p className="mt-3 text-sm font-semibold text-cyan-700">{collegeName}</p>
              </div>
            </div>

            <div className="grid min-w-[240px] grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[340px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Workflow
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Marks Posting Desk</p>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Ready for new entry</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200/60 sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-wrap gap-3 border-b border-slate-200 pb-5">
            <Link
              href={dashboardReturnUrl}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <Link
              href="/exam-report"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-100"
            >
              <ClipboardSignature className="h-4 w-4" />
              Exam Report
            </Link>
            <Link
              href={`/exams-form?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
            >
              <FilePenLine className="h-4 w-4" />
              New Entry
            </Link>
            <Link
              href={`/register?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            >
              <FilePenLine className="h-4 w-4" />
              Add Student
            </Link>
          </div>

          <div className="mb-8 border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md">
              <Inbox className="h-5 w-5" />
              Exam Marks Posting
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-[2rem]">Exam Entry Form</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Select the stream, academic cycle, student, exam type, and then post subjectwise marks in one workflow.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <section className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 md:p-6">
              <SectionHeader
                icon={BookKey}
                iconClassName="bg-gradient-to-br from-cyan-500 to-blue-600"
                title="Exam Context"
                description="Choose the academic stream, year, and exam schedule before posting marks."
              />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel icon={BookKey} iconClassName="bg-gradient-to-r from-cyan-500 to-blue-500">
                    Stream
                  </FieldLabel>
                  <select
                    name="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    className={modernInputClass}
                  >
                    <option value="">Select Stream</option>
                    {[...generalStreams, ...vocationalStreams].map((stream) => (
                      <option key={stream} value={stream}>
                        {stream}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel icon={BookKey} iconClassName="bg-gradient-to-r from-violet-500 to-purple-500">
                    Academic Year
                  </FieldLabel>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={modernInputClass}
                  >
                    <option value="">Select Academic Year</option>
                    {academicYearOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel icon={BookKey} iconClassName="bg-gradient-to-r from-amber-500 to-orange-500">
                    Exam Type
                  </FieldLabel>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    className={modernInputClass}
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel icon={CalendarClock} iconClassName="bg-gradient-to-r from-orange-500 to-rose-500">
                    Exam Date
                  </FieldLabel>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleChange}
                    className={modernInputClass}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 md:p-6">
              <SectionHeader
                icon={Users2}
                iconClassName="bg-gradient-to-br from-emerald-500 to-teal-500"
                title="Student Mapping"
                description="Pick the student under the selected stream and academic year."
              />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <FieldLabel icon={Users2} iconClassName="bg-gradient-to-r from-lime-500 to-emerald-500">
                    Student
                  </FieldLabel>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={modernInputClass}
                    disabled={!formData.stream}
                  >
                    <option value="">
                      {formData.stream ? "Select Student" : "Select Stream First"}
                    </option>
                    {filteredStudents.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Year of Study
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formData.yearOfStudy || "Not selected yet"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 md:p-6">
              <SectionHeader
                icon={FilePenLine}
                iconClassName="bg-gradient-to-br from-indigo-500 to-cyan-500"
                title="Subjectwise Marks"
                description="Enter marks for every subject in the selected exam."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {subjectsToRender.length === 0 ? (
                  <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    Select stream and exam context to load subject fields.
                  </div>
                ) : (
                  subjectsToRender.map((subject) => (
                    <div key={subject}>
                      <FieldLabel
                        icon={FilePenLine}
                        iconClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
                      >
                        {subject}
                      </FieldLabel>
                      <input
                        type="text"
                        name={`subject_${subject}`}
                        placeholder={`Enter ${subject} marks`}
                        value={
                          formData.subjects[subject] === 0 || formData.subjects[subject] === "0"
                            ? "0"
                            : formData.subjects[subject] || ""
                        }
                        onChange={handleChange}
                        className={modernInputClass}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 md:p-6">
              <SectionHeader
                icon={FileCheck2}
                iconClassName="bg-gradient-to-br from-emerald-500 to-blue-600"
                title="Calculated Summary"
                description="Totals update automatically based on valid marks entered."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Total Marks
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formData.total || 0}</p>
                </div>
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Percentage
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formData.percentage || 0}</p>
                </div>
              </div>
            </section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:from-cyan-700 hover:via-blue-700 hover:to-emerald-700 hover:shadow-2xl active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none"
              >
                <FileCheck2 className="h-5 w-5" />
                {isSubmitting ? "Saving..." : "Save Exam Marks"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
