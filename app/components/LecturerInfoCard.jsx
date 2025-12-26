//app/components/LecturerInfoCard.jsx

"use client";

import { AcademicCapIcon, EnvelopeIcon, UserCircleIcon, BuildingOffice2Icon } from "@heroicons/react/24/solid";

export default function LecturerInfoCard({ user }) {
  return (
    <div className="mx-auto mt-24 mb-6 flex max-w-3xl items-center gap-5 rounded-3xl border border-blue-200 bg-linear-to-r from-blue-50 via-sky-50 to-blue-100 p-5 shadow-lg">
      {/* Avatar / Icon circle */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-md">
        <UserCircleIcon className="h-14 w-14 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-blue-900">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserCircleIcon className="h-5 w-5" />
            </span>
            {user?.name || "Lecturer Name"}
          </p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-sm">
            Junior Lecturer
          </span>
        </div>

        <p className="flex items-center gap-2 text-sm font-medium text-blue-800 wrap-break-words">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <EnvelopeIcon className="h-4 w-4" />
          </span>
          {user?.email || "lecturer@example.com"}
        </p>

        <p className="flex items-center gap-2 text-sm text-slate-800 wrap-break-words">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <AcademicCapIcon className="h-4 w-4" />
          </span>
          Subject:&nbsp;
          <span className="font-semibold text-violet-800">
            {user?.subject || "Subject"}
          </span>
        </p>

        <p className="flex items-center gap-2 text-sm text-slate-800 wrap-break-words">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <BuildingOffice2Icon className="h-4 w-4" />
          </span>
          College:&nbsp;
          <span className="font-semibold text-teal-800">
            {user?.collegeName || "College Name"}
          </span>
        </p>
      </div>
    </div>
  );
}
