"use client";
import { Pencil, Trash2 } from "lucide-react";

export default function AttendanceTable({
  title,
  records,
  startDate,
  endDate,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-2">
        {title} —{" "}
        <span className="text-blue-600 font-bold text-sm">
          {startDate || "..."} to {endDate || "..."}
        </span>
      </h3>

      <div className="overflow-x-auto mb-8">
        {records && records.length > 0 ? (
          <table className="min-w-full border border-gray-300 text-center rounded-lg overflow-hidden shadow-md text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1 w-10">S.No</th>
                <th className="border px-2 py-1 w-36">Student</th>
                <th className="border px-2 py-1 w-16">Present</th>
                <th className="border px-2 py-1 w-16">Absent</th>
                <th className="border px-2 py-1 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 w-10">{i + 1}</td>
                  <td className="border px-2 py-1 w-36">{r.student}</td>
                  <td className="border px-2 py-1 w-16 text-green-600">
                    {r.present ? "✅" : ""}
                  </td>
                  <td className="border px-2 py-1 w-16 text-red-600">
                    {r.absent ? "❌" : ""}
                  </td>
                  <td className="border px-2 py-1 flex gap-2 justify-center p-1">
                    <button
                      onClick={() => onEdit(r)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(r._id, r.session)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 text-sm py-8">
            No {title.toLowerCase()} records found.
          </p>
        )}
      </div>
    </>
  );
}
