// app/components/LecturerWorkloadReport.jsx
function LecturerWorkloadReport({ data }) {
  if (!data.length) return null

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-xl font-bold text-center text-blue-900">
        Lecturer Workload Report
      </h3>

      <table className="w-full border border-black border-collapse">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="border p-2">Lecturer</th>
            <th className="border p-2">Theory</th>
            <th className="border p-2">Practical</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map(row => {
            let status = 'Normal'
            let rowColor = 'bg-green-100 text-green-800'

            if (row.total < MIN_PERIODS) {
              status = 'Underload'
              rowColor = 'bg-red-100 text-red-800'
            } else if (row.total > MAX_PERIODS) {
              status = 'Overload'
              rowColor = 'bg-red-200 text-red-900'
            }

            return (
              <tr
                key={row.lecturer}
                className={`text-center even:bg-blue-50 ${rowColor}`}
              >
                <td className="border p-2 font-semibold">
                  {row.lecturer}
                </td>
                <td className="border p-2">{row.theory}</td>
                <td className="border p-2">{row.practical}</td>
                <td className="border p-2 font-bold">{row.total}</td>
                <td className="border p-2 font-bold">
                  {status === 'Normal' && '🟢 Normal'}
                  {status === 'Underload' && '🔴 Underload'}
                  {status === 'Overload' && '🔴 Overload'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-3 flex gap-6 justify-center text-sm font-semibold">
        <span className="text-green-700">🟢 16–18 Periods : Normal</span>
        <span className="text-red-700">🔴 &lt;16 or &gt;18 : Under / Over Load</span>
      </div>
    </div>
  )
}