const themeMap = {
  MPC: {
    shell: "from-slate-100 via-blue-50 to-indigo-100",
    header: "from-blue-700 via-indigo-700 to-sky-600",
    soft: "from-blue-50 to-indigo-50",
    softBorder: "border-blue-100",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "bg-indigo-100 text-indigo-700",
  },
  BiPC: {
    shell: "from-slate-100 via-emerald-50 to-teal-100",
    header: "from-emerald-700 via-teal-700 to-cyan-600",
    soft: "from-emerald-50 to-teal-50",
    softBorder: "border-emerald-100",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "bg-teal-100 text-teal-700",
  },
  CEC: {
    shell: "from-slate-100 via-amber-50 to-orange-100",
    header: "from-amber-600 via-orange-600 to-rose-500",
    soft: "from-amber-50 to-orange-50",
    softBorder: "border-amber-100",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    badge: "bg-orange-100 text-orange-700",
  },
  HEC: {
    shell: "from-slate-100 via-rose-50 to-pink-100",
    header: "from-rose-700 via-pink-700 to-fuchsia-600",
    soft: "from-rose-50 to-pink-50",
    softBorder: "border-rose-100",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    badge: "bg-pink-100 text-pink-700",
  },
  CET: {
    shell: "from-slate-100 via-cyan-50 to-sky-100",
    header: "from-cyan-700 via-sky-700 to-blue-600",
    soft: "from-cyan-50 to-sky-50",
    softBorder: "border-cyan-100",
    pill: "bg-cyan-50 text-cyan-700 border-cyan-200",
    badge: "bg-sky-100 text-sky-700",
  },
  MLT: {
    shell: "from-slate-100 via-violet-50 to-fuchsia-100",
    header: "from-violet-700 via-fuchsia-700 to-pink-600",
    soft: "from-violet-50 to-fuchsia-50",
    softBorder: "border-violet-100",
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    badge: "bg-fuchsia-100 text-fuchsia-700",
  },
  "M&AT": {
    shell: "from-slate-100 via-emerald-50 to-lime-100",
    header: "from-slate-800 via-emerald-700 to-lime-600",
    soft: "from-slate-50 to-emerald-50",
    softBorder: "border-emerald-100",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "bg-lime-100 text-lime-700",
  },
};

const fallbackTheme = {
  shell: "from-slate-100 via-cyan-50 to-indigo-50",
  header: "from-slate-900 via-blue-900 to-cyan-700",
  soft: "from-white to-slate-50",
  softBorder: "border-slate-200",
  pill: "bg-slate-50 text-slate-700 border-slate-200",
  badge: "bg-slate-100 text-slate-700",
};

export function getGroupTheme(groupName) {
  return themeMap[groupName] || fallbackTheme;
}
