"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DEFAULT_COLLEGE_GROUPS } from "@/utils/collegeGroups";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";
import Image from "next/image";

const monthsList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const yearsList = ["First Year", "Second Year"];
const sessionList = ["FN", "AN"];

export default function AttendanceForm({
  defaultGroup = "",
  returnUrl = "/lecturer/dashboard",
}) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(defaultGroup);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collegeId, setCollegeId] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [groupsList, setGroupsList] = useState(DEFAULT_COLLEGE_GROUPS);

  const { data: session } = useSession();
  const router = useRouter();

  const [fullscreenToastMessage, setFullscreenToastMessage] = useState(null);
  const [showUnmarked, setShowUnmarked] = useState(false);

  const unmarkedStudents = filteredStudents.filter(
    (student) => !attendanceData[student._id]
  );

  const dynamicReturnUrl = returnUrl;

  // --------------------------------------------------
  // College / Session
  // --------------------------------------------------

  useEffect(() => {
    if (session?.user?.collegeId) {
      setCollegeId(session.user.collegeId);
    }

    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName);
    }
  }, [session]);

  // --------------------------------------------------
  // College Groups
  // --------------------------------------------------

  useEffect(() => {
    const fetchCollegeGroups = async () => {
      if (!session?.user?.collegeId) return;

      try {
        const res = await fetch(
          `/api/colleges/${session.user.collegeId}`
        );

        const data = await res.json();

        if (Array.isArray(data?.groups) && data.groups.length) {
          setGroupsList(data.groups);
        } else {
          setGroupsList(DEFAULT_COLLEGE_GROUPS);
        }
      } catch (error) {
        console.error("Failed to fetch college groups:", error);
        setGroupsList(DEFAULT_COLLEGE_GROUPS);
      }
    };

    fetchCollegeGroups();
  }, [session?.user?.collegeId]);

  // --------------------------------------------------
  // Lecturers
  // --------------------------------------------------

  useEffect(() => {
    if (!collegeId) return;

    fetch(`/api/lecturers?collegeId=${collegeId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          setLecturers(json.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch lecturers:", error);
      });
  }, [collegeId]);

  // --------------------------------------------------
  // Students
  // --------------------------------------------------

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGroup || !session?.user?.collegeId) {
        setStudents([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/students?collegeId=${session.user.collegeId}&group=${encodeURIComponent(
            selectedGroup
          )}&status=all&limit=100`
        );

        const json = await res.json();

        if (json.status === "success") {
          setStudents(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [selectedGroup, session]);

  // --------------------------------------------------
  // Filter Students
  // --------------------------------------------------

  useEffect(() => {
    if (selectedGroup && selectedYearOfStudy) {
      const normalizedSelectedGroup =
        normalizeAttendanceGroup(selectedGroup);

      setFilteredStudents(
        students.filter(
          (student) =>
            normalizeAttendanceGroup(student.group) ===
              normalizedSelectedGroup &&
            student.yearOfStudy === selectedYearOfStudy
        )
      );
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGroup, selectedYearOfStudy, students]);

  // --------------------------------------------------
  // Toggle Attendance
  // --------------------------------------------------

  const handleToggleChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // --------------------------------------------------
  // Submit Attendance
  // --------------------------------------------------

  const handleSubmit = async () => {
    if (
      !selectedDate ||
      !selectedGroup ||
      filteredStudents.length === 0 ||
      !selectedLecturerId ||
      !selectedSession
    ) {
      setFullscreenToastMessage(
        "Select date, group, session and lecturer. Ensure students visible."
      );
      return;
    }

    const dateObj = new Date(selectedDate);
    const month = monthsList[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    const lecturerInfo = lecturers.find(
      (lecturer) => lecturer._id === selectedLecturerId
    );

    const normalizedSelectedGroup =
      normalizeAttendanceGroup(selectedGroup);

    const attendanceRecords = filteredStudents.map((student) => ({
      studentId: student._id,
      date: selectedDate,

      ...(attendanceData[student._id]
        ? { status: attendanceData[student._id] }
        : {}),

      group: normalizedSelectedGroup,
      month,
      yearOfStudy: selectedYearOfStudy,
      lecturerId: selectedLecturerId,
      lecturerName: lecturerInfo?.name || "",
      collegeId,
      year,
      session: selectedSession,
    }));

    setIsLoading(true);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceRecords),
        credentials: "include",
      });

      const result = await response.json();

      // -----------------------------------------------
      // Existing duplicate / error protection
      // -----------------------------------------------

      if (response.status === 400 && result.status === "error") {
        setFullscreenToastMessage(
          result.message || "Attendance already taken!"
        );

        setIsLoading(false);
        return;
      }

      // -----------------------------------------------
      // Success
      // -----------------------------------------------

      if (result.status === "success") {
        const presentCount = filteredStudents.filter(
          (student) =>
            attendanceData[student._id] === "Present"
        ).length;

        const absentCount = filteredStudents.filter(
          (student) =>
            attendanceData[student._id] === "Absent"
        ).length;

        const unmarkedCount =
          filteredStudents.length -
          presentCount -
          absentCount;

        setFullscreenToastMessage({
          type: "success",
          present: presentCount,
          absent: absentCount,
          unmarked: unmarkedCount,
        });

        // Reset form
        setSelectedGroup("");
        setSelectedYearOfStudy("");
        setSelectedDate("");
        setSelectedLecturerId("");
        setSelectedSession("");
        setFilteredStudents([]);
        setAttendanceData({});
        setStudents([]);
        setShowUnmarked(false);

        // No automatic redirect.
        // User can read the summary first.
      } else {
        setFullscreenToastMessage(
          result.message || "Something went wrong!"
        );
      }
    } catch (error) {
      console.error("Attendance submit error:", error);

      setFullscreenToastMessage(
        "Error submitting attendance"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="relative w-full">

      {/* =================================================
          FULLSCREEN ATTENDANCE RESULT / ERROR POPUP
      ================================================= */}

      {fullscreenToastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            className={`w-full max-w-md rounded-2xl border-2 bg-white p-6 shadow-2xl ${
              typeof fullscreenToastMessage === "object"
                ? "border-green-400"
                : fullscreenToastMessage.includes("already marked")
                ? "border-red-400"
                : "border-amber-400"
            }`}
          >

            {/* SUCCESS */}
            {typeof fullscreenToastMessage === "object" ? (
              <>
                <div className="mb-5 text-center">

                  <div className="text-4xl">
                    ✅
                  </div>

                  <h2 className="mt-2 text-xl font-black text-green-700">
                    Attendance Submitted
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Attendance summary
                  </p>

                </div>

                {/* Counts */}

                <div className="grid grid-cols-3 gap-2">

                  {/* Present */}

                  <div className="rounded-xl bg-emerald-50 p-3 text-center">

                    <p className="text-xs font-bold text-emerald-700">
                      Present
                    </p>

                    <p className="mt-1 text-2xl font-black text-emerald-700">
                      {fullscreenToastMessage.present}
                    </p>

                  </div>

                  {/* Absent */}

                  <div className="rounded-xl bg-rose-50 p-3 text-center">

                    <p className="text-xs font-bold text-rose-700">
                      Absent
                    </p>

                    <p className="mt-1 text-2xl font-black text-rose-700">
                      {fullscreenToastMessage.absent}
                    </p>

                  </div>

                  {/* Unmarked */}

                  <div className="rounded-xl bg-amber-50 p-3 text-center">

                    <p className="text-xs font-bold text-amber-700">
                      Unmarked
                    </p>

                    <p className="mt-1 text-2xl font-black text-amber-700">
                      {fullscreenToastMessage.unmarked}
                    </p>

                  </div>

                </div>

                {/* Unmarked Warning */}

                {fullscreenToastMessage.unmarked > 0 && (
                  <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-sm font-bold text-amber-800">
                    ⚠️ {fullscreenToastMessage.unmarked}{" "}
                    {fullscreenToastMessage.unmarked === 1
                      ? "student"
                      : "students"}{" "}
                    still unmarked.
                  </p>
                )}

                {/* All Marked Message */}

                {fullscreenToastMessage.unmarked === 0 && (
                  <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-800">
                    ✓ All students are marked.
                  </p>
                )}

                {/* OK */}

                <button
                  type="button"
                  onClick={() => {
                    setFullscreenToastMessage(null);
                    router.push(dynamicReturnUrl);
                  }}
                  className="mt-5 w-full rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white shadow hover:bg-blue-800"
                >
                  OK
                </button>
              </>
            ) : (
              /* ERROR / WARNING */
              <>
                <div className="mb-3 text-center text-4xl">
                  {fullscreenToastMessage.includes(
                    "already marked"
                  )
                    ? "❌"
                    : "⚠️"}
                </div>

                <p
                  className={`text-center text-lg font-bold ${
                    fullscreenToastMessage.includes(
                      "already marked"
                    )
                      ? "text-red-700"
                      : "text-slate-700"
                  }`}
                >
                  {fullscreenToastMessage}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setFullscreenToastMessage(null)
                  }
                  className="mt-5 w-full rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white shadow hover:bg-blue-800"
                >
                  OK
                </button>
              </>
            )}

          </div>
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80">

          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-dashed" />

        </div>
      )}

      {/* =================================================
          MAIN FORM
      ================================================= */}

      <div className="w-full rounded-2xl border-2 border-blue-100 bg-white p-6 shadow-xl">

        {/* College Header */}

        <div className="mb-5 flex flex-col items-center">

          <div className="flex items-center gap-3 rounded-2xl border bg-linear-to-r from-blue-50 via-green-50 to-indigo-50 px-4 py-2 font-bold text-blue-700 shadow">

            <span className="text-2xl">
              🏫
            </span>

            <span className="tracking-wide">
              {collegeName || "Loading..."}
            </span>

          </div>

          <h1 className="my-2 text-2xl font-bold text-blue-800">
            Mark Attendance
          </h1>

          <p className="text-gray-500">
            Select date, group, session and ensure students are visible.
          </p>

        </div>

        {/* Back Button */}

        <div className="mb-4 flex justify-end">

          <Link href={dynamicReturnUrl}>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700"
            >
              ← Back to {defaultGroup || "Dashboard"}
            </button>

          </Link>

        </div>

        {/* =================================================
            FORM FIELDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-5">

          {/* Date */}

          <div>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
              className="block w-full rounded-xl border-2 border-blue-400 px-3 py-2 text-base focus:ring-2 focus:ring-indigo-400"
              required
            />

          </div>

          {/* Year */}

          <div>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Year
            </label>

            <select
              value={selectedYearOfStudy}
              onChange={(e) =>
                setSelectedYearOfStudy(e.target.value)
              }
              className="block w-full rounded-xl border-2 border-blue-400 bg-white px-3 py-2 text-base focus:ring-2 focus:ring-indigo-400"
            >

              <option value="">
                Select Year
              </option>

              {yearsList.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}

            </select>

          </div>

          {/* Group */}

          <div>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Group
            </label>

            <select
              value={selectedGroup}
              onChange={(e) =>
                setSelectedGroup(e.target.value)
              }
              className="block w-full rounded-xl border-2 border-blue-400 bg-white px-3 py-2 text-base focus:ring-2 focus:ring-indigo-400"
            >

              <option value="">
                Select Group
              </option>

              {groupsList.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}

            </select>

          </div>

          {/* Session */}

          <div>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Session
            </label>

            <select
              value={selectedSession}
              onChange={(e) =>
                setSelectedSession(e.target.value)
              }
              className="block w-full rounded-xl border-2 border-blue-400 bg-white px-3 py-2 text-base focus:ring-2 focus:ring-indigo-400"
              required
            >

              <option value="">
                Select Session
              </option>

              {sessionList.map((sessionName) => (
                <option key={sessionName} value={sessionName}>
                  {sessionName}
                </option>
              ))}

            </select>

          </div>

          {/* Lecturer */}

          <div>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Lecturer
            </label>

            <select
              value={selectedLecturerId}
              onChange={(e) =>
                setSelectedLecturerId(e.target.value)
              }
              className="block w-full rounded-xl border-2 border-blue-400 bg-white px-3 py-2 text-base focus:ring-2 focus:ring-indigo-400"
              required
            >

              <option value="">
                Select Lecturer
              </option>

              {lecturers.map((lecturer) => (
                <option
                  key={lecturer._id}
                  value={lecturer._id}
                >
                  {lecturer.name}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* =================================================
            UNMARKED ATTENDANCE
        ================================================= */}

        {filteredStudents.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-black text-amber-900">
                  Attendance Status
                </p>

                <p className="mt-1 text-xs text-amber-700">

                  {unmarkedStudents.length === 0
                    ? "All students have been marked Present or Absent."
                    : `${unmarkedStudents.length} student${
                        unmarkedStudents.length === 1
                          ? ""
                          : "s"
                      } attendance is not marked.`}

                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowUnmarked((prev) => !prev)
                }
                disabled={unmarkedStudents.length === 0}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black shadow-sm transition",

                  unmarkedStudents.length === 0
                    ? "cursor-not-allowed bg-emerald-100 text-emerald-700"
                    : "bg-amber-500 text-white hover:bg-amber-600",
                ].join(" ")}
              >

                {unmarkedStudents.length === 0
                  ? "✓ All Marked"
                  : `👉 Unmarked: ${unmarkedStudents.length}`}

                {unmarkedStudents.length > 0 && (
                  <span>
                    {showUnmarked ? "▲" : "▼"}
                  </span>
                )}

              </button>

            </div>

            {/* Unmarked Students */}

            {showUnmarked &&
              unmarkedStudents.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-amber-200 pt-3">

                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Students without attendance
                  </p>

                  {unmarkedStudents.map(
                    (student, index) => (
                      <div
                        key={student._id}
                        className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="min-w-0">

                          <p className="text-sm font-bold text-slate-900">
                            {index + 1}. {student.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {student.admissionNo ||
                              student.rollNumber ||
                              "Roll number not available"}
                          </p>

                        </div>

                        <div className="flex shrink-0 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleChange(
                                student._id,
                                "Present"
                              )
                            }
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            ✓ Present
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleChange(
                                student._id,
                                "Absent"
                              )
                            }
                            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
                          >
                            ✕ Absent
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

          </div>
        )}

        {/* =================================================
            STUDENTS GRID
        ================================================= */}

        {filteredStudents.length > 0 && (
          <div className="mt-6">

            <h3 className="mb-4 font-bold text-blue-700">
              Students List
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">

              {filteredStudents.map((student) => (

                <div
                  key={student._id}
                  className="flex flex-col items-center space-y-2 rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50 to-green-50 p-4 shadow transition hover:shadow-2xl"
                >

                  <Image
                    src={
                      student.photo ||
                      "/default-avatar.png"
                    }
                    alt={student.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full border-2 border-blue-400 object-cover shadow"
                  />

                  <h4 className="text-center text-lg font-bold text-gray-700">
                    {student.name}
                  </h4>

                  <div className="mt-2 flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleChange(
                          student._id,
                          "Present"
                        )
                      }
                      className={`rounded-full px-4 py-1 text-sm font-bold text-white shadow-lg transition ${
                        attendanceData[student._id] ===
                        "Present"
                          ? "bg-green-600"
                          : "bg-gray-400 hover:bg-green-500"
                      }`}
                    >
                      Present
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleChange(
                          student._id,
                          "Absent"
                        )
                      }
                      className={`rounded-full px-4 py-1 text-sm font-bold text-white shadow-lg transition ${
                        attendanceData[student._id] ===
                        "Absent"
                          ? "bg-red-600"
                          : "bg-gray-400 hover:bg-red-500"
                      }`}
                    >
                      Absent
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

        {/* =================================================
            SUBMIT BUTTON
        ================================================= */}

        {filteredStudents.length > 0 && (
          <div className="mt-8 flex justify-end">

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-xl bg-blue-700 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading
                ? "Submitting..."
                : "Submit Attendance"}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}