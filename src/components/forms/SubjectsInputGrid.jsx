"use client";

export default function SubjectsInputGrid({ subjectsToRender, subjects, onChange }) {
  if (!subjectsToRender?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {subjectsToRender.map((subject) => (
        <input
          key={subject}
          type="text"
          name={`subject_${subject}`}
          placeholder={`Enter ${subject} marks`}
          value={
            subjects[subject] === 0 || subjects[subject] === "0"
              ? "0"
              : subjects[subject] || ""
          }
          onChange={onChange}
          className="border p-2 rounded"
        />
      ))}
    </div>
  );
}
