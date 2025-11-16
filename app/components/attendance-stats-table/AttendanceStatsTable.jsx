// app/components/attendance-stats-table/AttendanceStatsTable.jsx
const groups = ['MPC', 'BiPC', 'CEC', 'HEC', 'M&AT', 'MLT', 'CET']
const years = ['First Year', 'Second Year']
const yearLabels = ['I', 'II']
const sessions = ['FN', 'AN']
const rowLabels = ['Present', 'Absent', 'Total', 'FN Total Present', 'AN Total Present']

const groupColors = {
  MPC: 'bg-red-100',
  BiPC: 'bg-green-100',
  CEC: 'bg-yellow-100',
  HEC: 'bg-purple-100',
  'M&AT': 'bg-pink-100',
  MLT: 'bg-orange-100',
  CET: 'bg-cyan-100',
}

// Table component as before
export default function AtAGlanceAttendanceTable({ stats }) {
  // Main getCellData mapping function moved inside component so it can use the stats prop
  function getCellData({ group, year, session, row }) {
    // stats may be provided as a function or as a nested data object; support both
    const s =
      typeof stats === 'function'
        ? stats(group, year, session)
        : (stats?.[group]?.[year]?.[session] ?? {})

    // Define cell return values based on requested row
    if (row === 'Present') return s.present ?? ''
    if (row === 'Absent') return s.absent ?? ''
    if (row === 'Total') return s.total ?? ''
    if (row === 'FN Total Present' && session === 'FN') return s.present ?? ''
    if (row === 'AN Total Present' && session === 'AN') return s.present ?? ''
    return ''
  }

  return (
    <div className="my-2 w-full overflow-x-auto rounded-2xl border border-blue-200 bg-white p-5 shadow-md">
      <table className="w-full min-w-[1080px] border-collapse text-xs md:text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 border bg-blue-200 p-2" rowSpan={3}>
              {' '}
            </th>
            {groups.map(group => (
              <th
                key={group}
                colSpan={4}
                className={`border p-2 text-center font-extrabold text-blue-900 ${groupColors[group]}`}
              >
                {group}
              </th>
            ))}
          </tr>
          <tr>
            {groups.map(group =>
              yearLabels.map(year => (
                <th
                  key={`${group}-${year}`}
                  colSpan={2}
                  className={`border p-1 text-center font-bold text-blue-800 ${groupColors[group]}`}
                >
                  {year}
                </th>
              ))
            )}
          </tr>
          <tr>
            {groups.map(group =>
              yearLabels.map(year =>
                sessions.map(session => (
                  <th
                    key={`${group}-${year}-${session}`}
                    className={`text-black-200 border p-1 text-center font-semibold ${groupColors[group]}`}
                  >
                    {session}
                  </th>
                ))
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map(rowLabel => (
            <tr key={rowLabel}>
              <td className="sticky left-0 z-10 border bg-teal-50 p-1 text-right font-bold">
                {rowLabel}
              </td>
              {groups.map(group =>
                yearLabels.map(year =>
                  sessions.map(session => (
                    <td
                      key={`${group}-${year}-${session}-row${rowLabel}`}
                      className={`${groupColors[group]} border p-1 text-center`}
                    >
                      {getCellData({
                        group,
                        year: year === 'I' ? 'First Year' : 'Second Year',
                        session,
                        row: rowLabel,
                      })}
                    </td>
                  ))
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
