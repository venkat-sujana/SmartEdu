'use client'

import Link from 'next/link'
import { getVisibleSections } from './groupDashboardConfig'

export default function GroupDashboardSidebar({
  groupName,
  routeSegment,
  includeEditAttendance,
  activeSection = 'overview',
}) {
  const sections = getVisibleSections(includeEditAttendance)

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
      
      <h2 className="mt-2 text-xl font-black text-slate-900">Sidebar Navigation</h2>
      

      <nav className="mt-5 md:hidden">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {sections.map(section => {
            const Icon = section.icon
            const href =
              section.key === 'overview'
                ? `/dashboards/${routeSegment}`
                : `/dashboards/${routeSegment}/${section.key}`
            const isActive = activeSection === section.key

            return (
              <Link
                key={section.key}
                href={href}
                className={`min-w-[140px] shrink-0 rounded-2xl border px-3 py-3 transition ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                      isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{section.label}</span>
                    <span
                      className={`block truncate text-[11px] ${
                        isActive ? 'text-white/75' : 'text-slate-500'
                      }`}
                    >
                      {section.description}
                    </span>
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <nav className="mt-5 hidden space-y-2 md:block">
        {sections.map(section => {
          const Icon = section.icon
          const href =
            section.key === 'overview'
              ? `/dashboards/${routeSegment}`
              : `/dashboards/${routeSegment}/${section.key}`
          const isActive = activeSection === section.key

          return (
            <Link
              key={section.key}
              href={href}
              className={`flex items-start gap-3 rounded-2xl border px-3 py-3 transition ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                  isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{section.label}</span>
                <span className={`block text-xs ${isActive ? 'text-white/75' : 'text-slate-500'}`}>
                  {section.description}
                </span>
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
