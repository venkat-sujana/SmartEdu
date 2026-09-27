"use client";

import { useEffect, useState } from "react";
import { getSubjectsForStream } from "@/utils/examSubjects";
import { useSession } from "next-auth/react";

export default function AssignmentsPage() {
  const [academicYear, setAcademicYear] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [group, setGroup] = useState("");
  const [subject, setSubject] = useState("");

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const { data: session } = useSession();

  const academicYears = [
    "2026-2027",
    "2027-2028",
    "2028-2029",
  ];

  const lecturerGroupMap = {
    MandAT: "M&AT",
    "M&AT": "M&AT",
    CET: "CET",
    MLT: "MLT",
    Botany: "BiPC",
    Zoology: "BiPC",
    Civics: "CEC",
    Economics: "CEC",
    Commerce: "CEC",
    History: "HEC",
    Maths: "MPC",
    Physics: "MPC",
    Chemistry: "MPC",
    GFC: "GFC",
  };

  const assignedGroup =
    session?.user?.role === "lecturer"
      ? lecturerGroupMap[session?.user?.subject] || ""
      : "";

  const subjects = group
    ? getSubjectsForStream(group)
    : [];

  /* =========================================================
     FETCH STUDENTS
  ========================================================= */

  useEffect(() => {
    const fetchStudents = async () => {
      if (!yearOfStudy || !group) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const params = new URLSearchParams({
          year: yearOfStudy,
          group,
          limit: "100",
        });

        const response = await fetch(
          `/api/students?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Students API failed with status ${response.status}`
          );
        }

        setStudents(
          Array.isArray(data?.data)
            ? data.data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to fetch students:",
          err
        );

        setStudents([]);
        setError(
          err.message ||
            "Failed to fetch students."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [yearOfStudy, group]);

  /* =========================================================
     FETCH SAVED ASSIGNMENT MARKS
  ========================================================= */

  useEffect(() => {
    const fetchAssignmentMarks = async () => {
      if (
        !academicYear ||
        !yearOfStudy ||
        !group ||
        !subject
      ) {
        setMarks({});
        return;
      }

      try {
        const params = new URLSearchParams({
          academicYear,
          yearOfStudy,
          group,
          subject,
        });

        const response = await fetch(
          `/api/assignments?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to fetch assignment marks."
          );
        }

        const savedMarks = {};

        if (Array.isArray(data)) {
          data.forEach((record) => {
            if (record.studentId?._id) {
              savedMarks[record.studentId._id] = {
                assignment1: record.assignment1,
                assignment2: record.assignment2,
                assignment3: record.assignment3,
                assignment4: record.assignment4,
                assignment5: record.assignment5,
                assignment6: record.assignment6,
                assignment7: record.assignment7,
                assignment8: record.assignment8,
                assignment9: record.assignment9,
                assignment10: record.assignment10,
              };
            }
          });
        }

        setMarks(savedMarks);
      } catch (err) {
        console.error(
          "Failed to fetch assignment marks:",
          err
        );
      }
    };

    fetchAssignmentMarks();
  }, [
    academicYear,
    yearOfStudy,
    group,
    subject,
  ]);

  /* =========================================================
     SAVE ALL MARKS
  ========================================================= */

  const handleSaveMarks = async () => {
    if (
      !academicYear ||
      !yearOfStudy ||
      !group ||
      !subject
    ) {
      setError(
        "Please select Academic Year, Year, Group and Subject."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const student of students) {
        const studentMarks =
          marks[student._id];

        if (!studentMarks) {
          continue;
        }

        const response = await fetch(
          "/api/assignments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              academicYear,
              yearOfStudy,
              group,
              subject,
              studentId: student._id,

              assignment1:
                studentMarks.assignment1 === "" ||
                studentMarks.assignment1 === undefined
                  ? null
                  : Number(studentMarks.assignment1),

              assignment2:
                studentMarks.assignment2 === "" ||
                studentMarks.assignment2 === undefined
                  ? null
                  : Number(studentMarks.assignment2),

              assignment3:
                studentMarks.assignment3 === "" ||
                studentMarks.assignment3 === undefined
                  ? null
                  : Number(studentMarks.assignment3),

              assignment4:
                studentMarks.assignment4 === "" ||
                studentMarks.assignment4 === undefined
                  ? null
                  : Number(studentMarks.assignment4),

              assignment5:
                studentMarks.assignment5 === "" ||
                studentMarks.assignment5 === undefined
                  ? null
                  : Number(studentMarks.assignment5),

              assignment6:
                studentMarks.assignment6 === "" ||
                studentMarks.assignment6 === undefined
                  ? null
                  : Number(studentMarks.assignment6),

              assignment7:
                studentMarks.assignment7 === "" ||
                studentMarks.assignment7 === undefined
                  ? null
                  : Number(studentMarks.assignment7),

              assignment8:
                studentMarks.assignment8 === "" ||
                studentMarks.assignment8 === undefined
                  ? null
                  : Number(studentMarks.assignment8),

              assignment9:
                studentMarks.assignment9 === "" ||
                studentMarks.assignment9 === undefined
                  ? null
                  : Number(studentMarks.assignment9),

              assignment10:
                studentMarks.assignment10 === "" ||
                studentMarks.assignment10 === undefined
                  ? null
                  : Number(studentMarks.assignment10),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to save assignment marks."
          );
        }
      }

      setSuccess(
        "All assignment marks saved successfully."
      );
    } catch (err) {
      console.error(
        "Failed to save assignment marks:",
        err
      );

      setError(
        err.message ||
          "Failed to save assignment marks."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     GENERATE PDF
  ========================================================= */

  const handleGeneratePDF = async () => {
    if (
      !academicYear ||
      !yearOfStudy ||
      !group ||
      !subject
    ) {
      setError(
        "Please select Academic Year, Year, Group and Subject."
      );
      return;
    }

    try {
      setError("");

      const params = new URLSearchParams({
        academicYear,
        yearOfStudy,
        group,
        subject,
      });

      const response = await fetch(
        `/api/assignments?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to fetch assignment marks."
        );
      }

      const {
        default: jsPDF,
      } = await import("jspdf");

      const {
        default: autoTable,
      } = await import(
        "jspdf-autotable"
      );

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      /* College Name */

      doc.setFontSize(15);
      doc.setFont(undefined, "bold");

      doc.text(
        session?.user?.collegeName ||
          "College Name",
        pageWidth / 2,
        15,
        {
          align: "center",
        }
      );

      /* Details */

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");

      doc.text(
        `Academic Year: ${academicYear}`,
        14,
        23
      );

      doc.text(
        `Year: ${yearOfStudy}`,
        14,
        28
      );

      doc.text(
        `Group: ${group}`,
        14,
        33
      );

      doc.text(
        `Subject: ${subject}`,
        14,
        38
      );

      /* Saved Marks Map */

      const savedMarksMap = {};

      if (Array.isArray(data)) {
        data.forEach((record) => {
          if (record.studentId?._id) {
            savedMarksMap[
              record.studentId._id
            ] = record;
          }
        });
      }

      /* Full Student Table */

      const rows = students.map(
        (student, index) => {
          const record =
            savedMarksMap[student._id] || {};

          return [
            index + 1,
            student.name || "-",
            record.assignment1 ?? "",
            record.assignment2 ?? "",
            record.assignment3 ?? "",
            record.assignment4 ?? "",
            record.assignment5 ?? "",
            record.assignment6 ?? "",
            record.assignment7 ?? "",
            record.assignment8 ?? "",
            record.assignment9 ?? "",
            record.assignment10 ?? "",
          ];
        }
      );

      autoTable(doc, {
        startY: 43,

        head: [
          [
            "S.No",
            "Student Name",
            "A1",
            "A2",
            "A3",
            "A4",
            "A5",
            "A6",
            "A7",
            "A8",
            "A9",
            "A10",
          ],
        ],

        body: rows,

        theme: "grid",

        styles: {
          fontSize: 6,
          cellPadding: 1.2,
          halign: "center",
          valign: "middle",
          lineColor: [180, 180, 180],
          lineWidth: 0.2,
          overflow: "linebreak",
        },

        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontSize: 6,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },

        columnStyles: {
          0: {
            cellWidth: 8,
            halign: "center",
          },

          1: {
            cellWidth: 46,
            halign: "left",
          },

          2: { cellWidth: 11 },
          3: { cellWidth: 11 },
          4: { cellWidth: 11 },
          5: { cellWidth: 11 },
          6: { cellWidth: 11 },
          7: { cellWidth: 11 },
          8: { cellWidth: 11 },
          9: { cellWidth: 11 },
          10: { cellWidth: 11 },
          11: { cellWidth: 11 },
        },

        margin: {
          left: 8,
          right: 8,
        },

        tableWidth: "auto",

        showHead: "everyPage",
      });

      const safeSubject =
        subject.replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );

      doc.save(
        `Assignment_Marks_${group}_${safeSubject}.pdf`
      );
    } catch (err) {
      console.error(
        "Failed to generate assignment PDF:",
        err
      );

      setError(
        err.message ||
          "Failed to generate assignment PDF."
      );
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 lg:px-6">

      {/* Page Header */}

      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          Assignment Marks
        </h1>

        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Enter assignment marks student-wise.
        </p>
      </div>

      {/* Selection Card */}

      <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5 lg:p-6">

        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Select Academic Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {/* Academic Year */}

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5">
              Academic Year
            </label>

            <select
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(
                  e.target.value
                );
                setSuccess("");
                setError("");
              }}
              className="w-full h-10 sm:h-11 border border-gray-300 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select Academic Year
              </option>

              {academicYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Year */}

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5">
              Year
            </label>

            <select
              value={yearOfStudy}
              onChange={(e) => {
                setYearOfStudy(
                  e.target.value
                );
                setGroup("");
                setSubject("");
                setStudents([]);
                setMarks({});
                setSuccess("");
                setError("");
              }}
              className="w-full h-10 sm:h-11 border border-gray-300 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select Year
              </option>

              <option value="First Year">
                First Year
              </option>

              <option value="Second Year">
                Second Year
              </option>
            </select>
          </div>

          {/* Group */}

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5">
              Group
            </label>

            <select
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setSubject("");
                setStudents([]);
                setMarks({});
                setSuccess("");
                setError("");
              }}
              disabled={!yearOfStudy}
              className="w-full h-10 sm:h-11 border border-gray-300 rounded-lg px-3 text-sm bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select Group
              </option>

              {session?.user?.role ===
              "lecturer" ? (
                assignedGroup && (
                  <option
                    value={assignedGroup}
                  >
                    {assignedGroup}
                  </option>
                )
              ) : (
                <>
                  <option value="MPC">
                    MPC
                  </option>

                  <option value="BiPC">
                    BiPC
                  </option>

                  <option value="CEC">
                    CEC
                  </option>

                  <option value="HEC">
                    HEC
                  </option>

                  <option value="CET">
                    CET
                  </option>

                  <option value="M&AT">
                    M&AT
                  </option>

                  <option value="MLT">
                    MLT
                  </option>
                </>
              )}
            </select>
          </div>

          {/* Subject */}

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5">
              Subject
            </label>

            <select
              value={subject}
              onChange={(e) => {
                setSubject(
                  e.target.value
                );
                setSuccess("");
                setError("");
              }}
              disabled={!group}
              className="w-full h-10 sm:h-11 border border-gray-300 rounded-lg px-3 text-sm bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select Subject
              </option>

              {subjects.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="mt-5 bg-white border rounded-xl p-6 sm:p-8 text-center text-sm text-gray-500">
          Loading students...
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Selected Details */}

      {!loading &&
        !error &&
        yearOfStudy &&
        group &&
        subject && (
          <div className="mt-5 bg-white border rounded-xl shadow-sm p-3 sm:p-5 lg:p-6">

            {/* Table Header */}

            <div className="mb-4 sm:mb-5">

              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Student Assignment Marks
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mt-1 wrap-break-word">
                {academicYear}{" "}
                | {yearOfStudy}{" "}
                | {group}{" "}
                | {subject}
              </p>

            </div>

            {/* Success */}

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 sm:px-4 py-3 text-xs sm:text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Assignment Marks Table */}

            {students.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">
                No students found for the selected year and group.
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-lg border border-gray-200">

                <table className="min-w-[1120px] w-full text-xs sm:text-sm border-collapse">

                  <thead>
                    <tr className="bg-gray-50 border-b">

                      <th className="sticky left-0 z-20 bg-gray-50 text-left px-2 sm:px-3 py-3 whitespace-nowrap">
                        S.No
                      </th>

                      <th className="sticky left-[45px] z-20 bg-gray-50 text-left px-2 sm:px-3 py-3 min-w-[220px] sm:min-w-[260px] whitespace-nowrap">
                        Student Name
                      </th>

                      {Array.from(
                        { length: 10 },
                        (_, index) =>
                          index + 1
                      ).map(
                        (number) => (
                          <th
                            key={number}
                            className="text-center px-2 py-3 min-w-20 sm:min-w-[90px] whitespace-nowrap"
                          >
                            A{number}
                          </th>
                        )
                      )}

                    </tr>
                  </thead>

                  <tbody>

                    {students.map(
                      (
                        student,
                        index
                      ) => (
                        <tr
                          key={student._id}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >

                          <td className="sticky left-0 z-10 bg-white px-2 sm:px-3 py-2.5 sm:py-3 whitespace-nowrap">
                            {index + 1}
                          </td>

                          <td className="sticky left-[45px] z-10 bg-white px-2 sm:px-3 py-2.5 sm:py-3 font-medium min-w-[220px] sm:min-w-[260px] whitespace-nowrap">
                            {student.name}
                          </td>

                          {Array.from(
                            {
                              length: 10,
                            },
                            (
                              _,
                              index
                            ) =>
                              index + 1
                          ).map(
                            (number) => (
                              <td
                                key={
                                  number
                                }
                                className="px-2 py-2 text-center"
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  inputMode="decimal"
                                  aria-label={`${student.name} Assignment ${number}`}
                                  className="w-[68px] sm:w-20 h-9 sm:h-10 border border-gray-300 rounded-lg px-1 sm:px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={
                                    marks[
                                      student
                                        ._id
                                    ]?.[
                                      `assignment${number}`
                                    ] ??
                                    ""
                                  }
                                  onChange={(
                                    e
                                  ) => {
                                    setMarks(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,
                                        [student._id]:
                                          {
                                            ...prev[
                                              student
                                                ._id
                                            ],
                                            [`assignment${number}`]:
                                              e
                                                .target
                                                .value,
                                          },
                                      })
                                    );
                                  }}
                                />
                              </td>
                            )
                          )}

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

            {/* Action Buttons */}

            {students.length > 0 && (
              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleSaveMarks
                  }
                  className="w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving
                    ? "Saving..."
                    : "Save All Assignment Marks"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleGeneratePDF
                  }
                  className="w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 active:bg-blue-100 transition"
                >
                  Generate PDF
                </button>

              </div>
            )}

          </div>
        )}

    </div>
  );
}