//src/app/principal/dashboard/OverviewStatCard.jsx

"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function OverviewStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentClassName = "text-slate-700",
  iconClassName = "bg-slate-100 text-slate-700",
  loading = false,
}) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-2 p-3 sm:p-4">
        {/* Stat details */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500 sm:text-xs">
            {title}
          </p>

          <p
            className={`mt-1.5 truncate text-2xl font-black leading-tight tracking-tight sm:text-3xl ${accentClassName}`}
          >
            {loading ? "..." : value ?? 0}
          </p>

          {subtitle ? (
            <p className="mt-1 truncate text-xs leading-snug text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Compact icon */}
        {Icon ? (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-2 sm:h-10 sm:w-10 ${iconClassName}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
