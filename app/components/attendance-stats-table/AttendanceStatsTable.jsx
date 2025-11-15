
// app/components/attendance-stats-table/AttendanceStatsTable.jsx
const groups = ["MPC", "BiPC", "CEC", "HEC", "M&AT", "MLT", "CET"];
const years = ["First Year", "Second Year"];
const yearLabels = ["I", "II"];
const sessions = ["FN", "AN"];
const rowLabels = [
  "Present",
  "Absent",
  "Total",
  "FN Total Present",
  "AN Total Present"
];

const groupColors = {
  MPC: "bg-red-300",
  BiPC: "bg-green-300",
  CEC: "bg-yellow-300",
  HEC: "bg-purple-300",
  "M&AT": "bg-pink-300",
  MLT: "bg-orange-300",
  CET: "bg-cyan-300",
};



// Table component as before
export default function AtAGlanceAttendanceTable({ stats }) {
  // Main getCellData mapping function moved inside component so it can use the stats prop
  function getCellData({ group, year, session, row }) {
    // stats may be provided as a function or as a nested data object; support both
    const s =
      typeof stats === "function"
        ? stats(group, year, session)
        : (stats?.[group]?.[year]?.[session] ?? {});

    // Define cell return values based on requested row
    if (row === "Present") return s.present ?? "";
    if (row === "Absent") return s.absent ?? "";
    if (row === "Total") return s.total ?? "";
    if (row === "FN Total Present" && session === "FN") return s.present ?? "";
    if (row === "AN Total Present" && session === "AN") return s.present ?? "";
    return "";
  }

    return (
    <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-md p-5 border border-blue-200 my-2">
      <table className="min-w-[1080px] w-full text-xs md:text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2 border bg-blue-200 sticky left-0 z-20" rowSpan={3}>
              {" "}
            </th>
            {groups.map((group) => (
              <th
                key={group}
                colSpan={4}
                className={`p-2 border text-blue-900 font-extrabold text-center ${groupColors[group]}`}
              >
                {group}
              </th>
            ))}
          </tr>
          <tr>
            {groups.map((group) =>
              yearLabels.map((year) => (
                <th
                  key={`${group}-${year}`}
                  colSpan={2}
                  className={`p-1 border text-blue-800 font-bold text-center ${groupColors[group]}`}
                >
                  {year}
                </th>
              ))
            )}
          </tr>
          <tr>
            {groups.map((group) =>
              yearLabels.map((year) =>
                sessions.map((session) => (
                  <th
                    key={`${group}-${year}-${session}`}
                    className={`p-1 border text-black-200 font-semibold text-center ${groupColors[group]}`}
                  >
                    {session}
                  </th>
                ))
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((rowLabel) => (
            <tr key={rowLabel}>
              <td className="p-1 border text-right font-bold bg-teal-50 sticky left-0 z-10">
                {rowLabel}
              </td>
              {groups.map((group) =>
                yearLabels.map((year) =>
                  sessions.map((session) => (
                    <td
                      key={`${group}-${year}-${session}-row${rowLabel}`}
                      className={`${groupColors[group]} p-1 border text-center`}
                    >
                      {getCellData({
                        group,
                        year: year === "I" ? "First Year" : "Second Year",
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
  );
}
