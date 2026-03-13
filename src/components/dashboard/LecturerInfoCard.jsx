"use client";

import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { getGroupTheme } from "@/components/dashboard/groupTheme";

export default function LecturerInfoCard({ user, groupName }) {
  const theme = getGroupTheme(groupName);
  const infoItems = [
    {
      label: "Email",
      value: user?.email || "lecturer@example.com",
      icon: <EnvelopeIcon className="h-4 w-4" />,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      label: "Subject",
      value: user?.subject || "Subject",
      icon: <AcademicCapIcon className="h-4 w-4" />,
      tone: "bg-violet-100 text-violet-700",
    },
    {
      label: "College",
      value: user?.collegeName || "College Name",
      icon: <BuildingOffice2Icon className="h-4 w-4" />,
      tone: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <motion.section
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className={`bg-linear-to-r ${theme.header} px-5 py-6 text-white`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-white/10 shadow-inner">
              <UserCircleIcon className="h-12 w-12 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Lecturer Profile
              </p>
              <h2 className="mt-2 truncate text-lg font-black tracking-tight md:text-xl">
                {user?.name || "Lecturer Name"}
              </h2>
            </div>
          </div>

          <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${theme.badge}`}>
            Junior Lecturer
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:p-5">
        {infoItems.map(item => (
          <div
            key={item.label}
            className={`flex flex-col gap-3 rounded-2xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-4 sm:flex-row sm:items-center`}
          >
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
