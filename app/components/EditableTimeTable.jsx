"use client";
import { useState, useRef } from "react";

// 🔹 STREAM WISE SUBJECTS
const SUBJECTS = {
  general: [
    "",
    "Maths",
    "Physics",
    "Chemistry",
    "Physics Practicals",
    "Chemistry Practicals",
    "Botany",
    "Botany Practicals",
    "Zoology",
    "Zoology Practicals",
    "Civics",
    "Economics",
    "History",
    "Commerce",
    "English",
    "Telugu",
    "Sanskrit",
    "Hindi",
    "Study Hour"
  ],
  vocational: [
    "",
    "English",
    "GFC",
    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
    "V1 Practicals",
    "V2 Practicals",
    "V3 Practicals",
    "V4 Practicals",
    "V5 Practicals",
    "V6 Practicals",
    "Study Hour",
    "Bridge Course"
  ],
};


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// 👉 Columns including BREAK & LUNCH
const COLUMNS = [
  { label: "9:10 - 10:00", type: "period" },
  { label: "10:00 - 10:50", type: "period" },
  { label: "BREAK", type: "break" },
  { label: "11:00 - 11:50", type: "period" },
  { label: "11:50 - 12:40", type: "period" },
  { label: "LUNCH", type: "lunch" },
  { label: "1:20 - 2:10", type: "period" },
  { label: "2:10 - 3:00", type: "period" },
  { label: "3:10 - 4:00", type: "period" },
  { label: "4:00 - 5:00", type: "period" },
];




export default function EditableTimeTable({ title,stream = "general" }) {
  const printRef = useRef(null);
  const [editing, setEditing] = useState(null);

  const [table, setTable] = useState(
    DAYS.map(() =>
      COLUMNS.map((c) => (c.type === "period" ? "" : c.label))
    )
  );

  const updateCell = (d, p, value) => {
    const copy = [...table];
    copy[d][p] = value;
    setTable(copy);
  };

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const original = document.body.innerHTML;
    document.body.innerHTML = content;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  return (
    <div className="mt-12">
      {/* Print Button */}
      <div className="flex justify-end mb-2 no-print">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm hover:bg-blue-800 cursor-pointer"
        >
          🖨 Print / PDF
        </button>
      </div>

      <div ref={printRef} className="overflow-x-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">
          {title}
        </h2>

        <table className="border-collapse w-full min-w-[1100px] border border-black">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="border p-2">Day</th>
              {COLUMNS.map((c, i) => (
                <th key={i} className="border p-2 text-sm whitespace-pre-line">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map((day, dIndex) => (
              <tr key={day} className="even:bg-blue-50">
                <td className="border p-2 font-semibold">{day}</td>

                {COLUMNS.map((c, pIndex) => (


 <td
  key={pIndex}
  className={`border p-2 text-center cursor-pointer
    ${
      c.type === "break"
        ? "bg-gray-300 font-bold cursor-default"
        : c.type === "lunch"
        ? "bg-gray-400 font-bold cursor-default"
        : ""
    }
  `}
  onClick={() => {
    if (c.type === "period") {
      setEditing({ dIndex, pIndex });
    }
  }}
>
  {c.type === "period" ? (
    editing?.dIndex === dIndex && editing?.pIndex === pIndex ? (
      <select
        autoFocus
        value={table[dIndex][pIndex]}
        onChange={(e) => {
          updateCell(dIndex, pIndex, e.target.value);
          setEditing(null); // ✅ close select after choose
        }}
        onBlur={() => setEditing(null)}
        className="w-full bg-white text-center outline-none border rounded"
      >
        {SUBJECTS[stream].map((sub) => (
          <option key={sub} value={sub}>
            {sub || "Select"}
          </option>
        ))}
      </select>
    ) : (
      <span className="block min-h-6">
        {table[dIndex][pIndex] || "Select"}
      </span>
    )
  ) : (
    table[dIndex][pIndex]
  )}
</td>




                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
