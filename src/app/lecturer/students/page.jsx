
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Search, RefreshCw, Pencil, X, Users } from "lucide-react";
import toast from "react-hot-toast";

const initialForm = {
  name: "",
  fatherName: "",
  mobile: "",
  parentMobile: "",
  caste: "",
  dob: "",
  gender: "",
  address: "",
};

export default function LecturerStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        status: "Active",
        page: String(page),
        limit: "20",
      });

      if (search.trim()) params.set("search", search.trim());
      if (year) params.set("yearOfStudy", year);

      // Do not pass a group or college chosen by the client.
      // The server determines the lecturer's authorized groups.
      const response = await fetch(`/api/students?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load students");
      }

      setStudents(Array.isArray(result.data) ? result.data : []);
      setTotalStudents(result.totalStudents || 0);
      setTotalPages(result.totalPages || 0);
    } catch (err) {
      setStudents([]);
      setTotalStudents(0);
      setTotalPages(0);
      setError(err.message || "Unable to load student records");
    } finally {
      setLoading(false);
    }
  }, [page, search, year]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  function openEditor(student) {
    setEditingStudent(student);
    setForm({
      name: student.name || "",
      fatherName: student.fatherName || "",
      mobile: student.mobile || "",
      parentMobile: student.parentMobile || "",
      caste: student.caste || "",
      dob: student.dob
        ? new Date(student.dob).toISOString().slice(0, 10)
        : "",
      gender: student.gender || "",
      address: student.address || "",
    });
  }

  async function saveStudent(event) {
    event.preventDefault();
    if (!editingStudent) return;

    setSaving(true);

    try {
      const response = await fetch(
        `/api/students/${editingStudent._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            fatherName: form.fatherName.trim(),
            mobile: form.mobile.trim(),
            parentMobile: form.parentMobile.trim(),
            caste: form.caste,
            dob: form.dob || null,
            gender: form.gender,
            address: form.address.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update student");
      }

      toast.success("Student details updated");
      setEditingStudent(null);
      await loadStudents();
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Records
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Students belonging to your mapped groups
          </p>
        </div>

        <button
          type="button"
          onClick={loadStudents}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <section className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="relative block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Search students
          </span>
          <Search
            size={18}
            className="absolute bottom-3 left-3 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or admission details"
            className="w-full rounded-lg border py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Year of study
          </span>
          <select
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All years</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
          </select>
        </label>
      </section>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users size={18} />
        <span>
          Total students: <strong>{totalStudents}</strong>
        </span>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          Loading student records...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadStudents}
            className="mt-3 rounded-lg border border-red-300 px-3 py-2"
          >
            Try again
          </button>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          No student records found for your mapped groups.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Group</th>
                <th className="p-3">Year</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {student.photo ? (
                        <Image
                          src={student.photo}
                          alt={student.name || "Student"}
                          width={44}
                          height={44}
                          unoptimized
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-500">
                          {(student.name || "S").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {student.name || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.admissionNo || "No admission number"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{student.group || "—"}</td>
                  <td className="p-3">{student.yearOfStudy || "—"}</td>
                  <td className="p-3">{student.mobile || "—"}</td>
                  <td className="p-3">{student.status || "Active"}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => openEditor(student)}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-gray-100"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <section className="my-6 w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Student Details</h2>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                aria-label="Close edit form"
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveStudent} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["name", "Student Name", true],
                  ["fatherName", "Father Name", false],
                  ["mobile", "Mobile", false],
                  ["parentMobile", "Parent Mobile", false],
                  ["caste", "Caste", false],
                  ["dob", "Date of Birth", false],
                ].map(([key, label, required]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-1 block font-medium">{label}</span>
                    <input
                      type={key === "dob" ? "date" : "text"}
                      required={required}
                      value={form[key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </label>
                ))}

                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Gender</span>
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        gender: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">Address</span>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
