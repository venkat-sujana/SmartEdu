"use client";
import { memo, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";

// Memoized table row component
const TableRow = memo(function TableRow({ record, index, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="border border-slate-200 px-2 py-2 w-10 text-slate-600">{index + 1}</td>
      <td className="border border-slate-200 px-2 py-2 w-36 font-medium text-slate-800">{record.student}</td>
      <td className="border border-slate-200 px-2 py-2 w-16 text-center">
        {record.present ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs">✓</span>
        ) : null}
      </td>
      <td className="border border-slate-200 px-2 py-2 w-16 text-center">
        {record.absent ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs">✗</span>
        ) : null}
      </td>
      <td className="border border-slate-200 px-2 py-2">
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => onEdit(record)}
            className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
            title="Edit"
            aria-label="Edit attendance record"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(record._id, record.session)}
            className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Delete"
            aria-label="Delete attendance record"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default memo(function AttendanceTable({
  title,
  records,
  startDate,
  endDate,
  onEdit,
  onDelete,
}) {
  // Memoized records to prevent unnecessary re-renders
  const memoizedRecords = useMemo(() => records || [], [records]);
  const hasRecords = memoizedRecords.length > 0;

  // Memoized date range display
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    return "Select date range...";
  }, [startDate, endDate]);

  if (!hasRecords) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-slate-800">
          {title} —{" "}
          <span className="text-blue-600 font-medium text-sm">{dateRange}</span>
        </h3>
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
          <p className="text-slate-500">
            No {title.toLowerCase()} records found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3 text-slate-800">
        {title} —{" "}
        <span className="text-blue-600 font-medium text-sm">{dateRange}</span>
      </h3>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full text-center text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="border border-slate-200 px-2 py-2 w-10 font-semibold text-slate-700">#</th>
              <th className="border border-slate-200 px-2 py-2 w-36 font-semibold text-slate-700">Student</th>
              <th className="border border-slate-200 px-2 py-2 w-16 font-semibold text-green-700">Present</th>
              <th className="border border-slate-200 px-2 py-2 w-16 font-semibold text-red-700">Absent</th>
              <th className="border border-slate-200 px-2 py-2 w-20 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {memoizedRecords.map((record, i) => (
              <TableRow
                key={record._id || i}
                record={record}
                index={i}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
