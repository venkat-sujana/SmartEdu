//src/components/attendance/cards/ConsecutiveAbsenteesCard.jsx
'use client'
import Link from 'next/link'
export default function ConsecutiveAbsenteesCard({
  data = [],
  title = 'Consecutive Absentees',
  loading = false,
  showViewAll = true,
  viewAllLink = '/attendance/consecutive-absentees',
}) {
  const getBadgeColor = days => {
    if (days >= 7) {
      return 'border-red-300 bg-red-100 text-red-700'
    }

    if (days >= 5) {
      return 'border-orange-300 bg-orange-100 text-orange-700'
    }

    return 'border-yellow-300 bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="pr-2 text-base font-bold text-gray-800 sm:text-lg">Warning {title}</h2>

        {!loading && (
          <span className="inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 sm:text-sm">
            {data.length} Students
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="rounded-xl bg-green-50 px-4 py-5 text-center">
          <p className="font-medium text-green-600">No Consecutive Absentees</p>
          <p className="mt-1 text-sm text-gray-500">All students are attending regularly.</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="space-y-3">
          {data.map(student => (
            <div
              key={student.studentId}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 transition hover:bg-gray-50 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-gray-800 sm:text-base">
                      {student.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-blue-700">
                        Group: {student.group}
                      </span>
                      <span className="rounded-md bg-purple-50 px-2.5 py-1 text-purple-700">
                        {student.yearOfStudy}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold sm:hidden ${getBadgeColor(
                      student.consecutiveAbsentDays
                    )}`}
                  >
                    {student.consecutiveAbsentDays} Day
                    {student.consecutiveAbsentDays > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                  <div className="min-w-0 wrap-break-word">
                    <span className="font-medium">Adm No:</span> {student.admissionNo}
                  </div>

                  {student.parentMobile ? (
                    <div className="min-w-0 wrap-break-word text-green-700">
                      Parent: {student.parentMobile}
                    </div>
                  ) : null}
                </div>
              </div>

              <span
                className={`hidden shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold sm:inline-flex ${getBadgeColor(
                  student.consecutiveAbsentDays
                )}`}
              >
                {student.consecutiveAbsentDays} Day
                {student.consecutiveAbsentDays > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && showViewAll && data.length > 0 && (
        <div className="mt-4 flex justify-start sm:justify-end">
          <Link
            href={viewAllLink}
            className="inline-flex items-center rounded-lg px-1 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All {'>'}
          </Link>
        </div>
      )}
    </div>
  )
}
