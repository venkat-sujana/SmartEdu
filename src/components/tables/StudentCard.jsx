//src/components/tables/StudentCard.jsx

"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

export default function StudentCard({ student, index, offset, onEdit, onDelete, normalizeDate }) {
  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">#{offset + index + 1}</p>
          <h3 className="truncate text-base font-bold text-slate-900">{student.name}</h3>
          <p className="truncate text-sm text-slate-500">Father: {student.fatherName}</p>
        </div>
        <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {student.photo ? (
            <Image src={student.photo} alt={student.name} width={56} height={56} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">N/A</div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <InfoChip label="Admission" value={student.admissionNo} />
        <InfoChip label="Mobile" value={student.mobile} />
        <InfoChip label="Parent Mobile" value={student.parentMobile} />
        <InfoChip label="Caste" value={student.caste} />
        <InfoChip label="Gender" value={student.gender} />
        <InfoChip label="Year" value={student.yearOfStudy} />
        <InfoChip label="Group" value={student.group} />
        <InfoChip label="DOB" value={normalizeDate(student.dob) || "—"} />
        <InfoChip label="Date of Joining" value={normalizeDate(student.dateOfJoining) || "—"} />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onEdit}
          aria-label={`Edit ${student.name}`}
          className="flex-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-200"
        >
          <span className="inline-flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </span>
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${student.name}`}
          className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-200"
        >
          <span className="inline-flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </span>
        </button>
      </div>
    </article>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-slate-700">{value || "-"}</p>
    </div>
  );
}
