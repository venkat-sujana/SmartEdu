export default function LecturerWorkloadReport({ data }) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-900">
        Lecturer Workload Report
      </h2>

      <table className="w-full border border-black border-collapse">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="border p-2">Lecturer</th>
            <th className="border p-2">Theory Periods</th>
            <th className="border p-2">Practical Periods</th>
            <th className="border p-2">Total Periods / Week</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.lecturer} className="text-center even:bg-blue-50">
              <td className="border p-2 font-semibold">{row.lecturer}</td>
              <td className="border p-2">{row.theory}</td>
              <td className="border p-2">{row.practical}</td>
              <td className="border p-2 font-bold">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
