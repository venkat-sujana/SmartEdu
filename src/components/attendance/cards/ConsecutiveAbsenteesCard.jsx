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
      return 'bg-red-100 text-red-700 border-red-300'
    }

    if (days >= 5) {
      return 'bg-orange-100 text-orange-700 border-orange-300'
    }

    return 'bg-yellow-100 text-yellow-700 border-yellow-300'
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">⚠️ {title}</h2>

        {!loading && (
          <span className="text-sm font-medium text-gray-500">{data.length} Students</span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div className="py-3 text-center">
          <p className="font-medium text-green-600">🎉 No Consecutive Absentees</p>
          <p className="mt-1 text-sm text-gray-500">All students are attending regularly.</p>
        </div>
      )}

      {/* Student List */}
      {!loading && data.length > 0 && (
        <div className="space-y-3">
          {data.map(student => (
            <div
              key={student.studentId}
              className="flex flex-col gap-3 rounded-lg border p-3 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{student.name}</h3>

                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                    🎓 {student.group}
                  </span>

                  <span className="rounded bg-purple-50 px-2 py-1 text-purple-700">
                    {student.yearOfStudy}
                  </span>
                </div>

                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Adm No:</span> {student.admissionNo}
                </div>

                {student.parentMobile && (
                  <div className="mt-1 text-xs text-green-700">📞 {student.parentMobile}</div>
                )}
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${getBadgeColor(
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

      {/* Footer */}
      {!loading && showViewAll && data.length > 0 && (
        <div className="mt-4 text-right">
          <Link
            href={viewAllLink}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All →
          </Link>
        </div>
      )}
    </div>
  )
}
