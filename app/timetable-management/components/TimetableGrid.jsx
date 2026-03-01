"use client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableGrid({ slots = [], onDeleteSlot }) {
  const map = new Map(slots.map((s) => [`${s.day}|${s.period}`, s]));

  return (
    <div className="overflow-auto rounded-xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-2 py-2 text-left">Day</th>
            {PERIODS.map((p) => (
              <th key={p} className="border px-2 py-2 text-center">{`P${p}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day}>
              <td className="border px-2 py-2 font-semibold">{day}</td>
              {PERIODS.map((period) => {
                const slot = map.get(`${day}|${period}`);
                return (
                  <td key={`${day}-${period}`} className="border px-2 py-2 align-top">
                    {slot ? (
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{slot.subjectId?.subjectName || "-"}</p>
                        <p className="text-xs text-slate-600">{slot.subjectId?.subjectCode || ""}</p>
                        <p className="text-xs text-indigo-700">{slot.lecturerId?.name || "-"}</p>
                        <p className="text-[11px] text-slate-500">{slot.classroom}</p>
                        {onDeleteSlot && (
                          <button
                            onClick={() => onDeleteSlot(slot)}
                            className="rounded bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

