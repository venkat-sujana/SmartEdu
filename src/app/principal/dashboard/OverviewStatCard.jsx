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
    <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-md transition-transform duration-200 hover:-translate-y-0.5">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <p className={`mt-3 text-3xl font-black tracking-tight ${accentClassName}`}>
            {loading ? "..." : value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-2xl p-3 ${iconClassName}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
