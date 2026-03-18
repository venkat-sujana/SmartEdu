/// Admin Panel Page - Manage Colleges, Students, Lecturers, and Principals
//src/app/admin-panel/page.jsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  GraduationCap,
  Search,
  School,
  ShieldCheck,
  ShieldPlus,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const ENTITY_CONFIG = {
  colleges: {
    label: "Colleges",
    icon: Building2,
    endpoint: "/api/admin/colleges",
    hasCollegeFilter: false,
    fields: [
      { name: "name", label: "College Name", type: "text", required: true },
      { name: "code", label: "College Code", type: "text", required: true },
      { name: "address", label: "Address", type: "textarea" },
      { name: "district", label: "District", type: "text" },
      { name: "contactEmail", label: "Contact Email", type: "email" },
      { name: "contactPhone", label: "Contact Phone", type: "text" },
      { name: "groups", label: "Groups (comma separated)", type: "textarea" },
    ],
    columns: [
      { key: "name", label: "College" },
      { key: "code", label: "Code" },
      { key: "district", label: "District" },
      { key: "contactEmail", label: "Email" },
      { key: "contactPhone", label: "Phone" },
    ],
  },
  students: {
    label: "Students",
    icon: Users,
    endpoint: "/api/admin/students",
    hasCollegeFilter: true,
    fields: [
      { name: "collegeId", label: "College", type: "select", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "fatherName", label: "Father Name", type: "text", required: true },
      { name: "mobile", label: "Mobile", type: "text", required: true },
      { name: "admissionNo", label: "Admission No", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "group", label: "Group", type: "select", required: true, options: ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"] },
      { name: "yearOfStudy", label: "Year", type: "select", required: true, options: ["First Year", "Second Year"] },
      { name: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Other"] },
      { name: "caste", label: "Caste", type: "select", required: true, options: ["OC", "OBC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC-A", "SC-B", "SC-C", "SC", "ST", "OTHER"] },
      { name: "status", label: "Status", type: "select", options: ["Active", "Terminated"] },
      { name: "admissionYear", label: "Admission Year", type: "number", required: true },
      { name: "dob", label: "DOB", type: "date" },
      { name: "dateOfJoining", label: "Date of Joining", type: "date" },
      { name: "photo", label: "Photo URL", type: "text" },
      { name: "address", label: "Address", type: "textarea", required: true },
    ],
    columns: [
      { key: "name", label: "Student" },
      { key: "admissionNo", label: "Admission No" },
      { key: "group", label: "Group" },
      { key: "yearOfStudy", label: "Year" },
      { key: "mobile", label: "Mobile" },
      { key: "status", label: "Status" },
      { key: "college", label: "College", render: (item) => item.collegeId?.name || "-" },
    ],
  },
  lecturers: {
    label: "Lecturers",
    icon: GraduationCap,
    endpoint: "/api/admin/lecturers",
    hasCollegeFilter: true,
    fields: [
      { name: "collegeId", label: "College", type: "select", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "subject", label: "Subject", type: "select", required: true, options: ["Maths", "Physics", "English", "Telugu", "Hindi", "Civics", "Zoology", "Botany", "Chemistry", "CET", "MLT", "Economics", "History", "Commerce", "MandAT", "GFC"] },
      { name: "photo", label: "Photo URL", type: "text" },
    ],
    columns: [
      { key: "name", label: "Lecturer" },
      { key: "email", label: "Email" },
      { key: "subject", label: "Subject" },
      { key: "college", label: "College", render: (item) => item.collegeId?.name || item.collegeName || "-" },
    ],
  },
  principals: {
    label: "Principals",
    icon: School,
    endpoint: "/api/admin/principals",
    hasCollegeFilter: true,
    fields: [
      { name: "collegeId", label: "College", type: "select", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "dateOfJoining", label: "Date of Joining", type: "date" },
      { name: "photo", label: "Photo URL", type: "text" },
    ],
    columns: [
      { key: "name", label: "Principal" },
      { key: "email", label: "Email" },
      { key: "dateOfJoining", label: "Joined", render: (item) => formatDate(item.dateOfJoining) },
      { key: "college", label: "College", render: (item) => item.collegeId?.name || "-" },
    ],
  },
};

const INITIAL_FORM = {
  collegeId: "",
  name: "",
  email: "",
  password: "",
  subject: "",
  photo: "",
  fatherName: "",
  mobile: "",
  admissionNo: "",
  group: "",
  yearOfStudy: "",
  gender: "",
  caste: "",
  status: "Active",
  admissionYear: new Date().getFullYear(),
  dob: "",
  dateOfJoining: "",
  address: "",
  code: "",
  district: "",
  contactEmail: "",
  contactPhone: "",
  groups: "",
};

export default function AdminPanelPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const [entity, setEntity] = useState("colleges");
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeConfig = ENTITY_CONFIG[entity];

  useEffect(() => {
    if (!isAdmin) return;
    loadColleges();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchRecords();
  }, [isAdmin,entity,selectedCollegeId,search]);

  const summary = useMemo(() => `${records.length} ${activeConfig.label.toLowerCase()} loaded`, [records, activeConfig.label]);
  const selectedCollegeGroups = useMemo(() => {
    if (!form.collegeId) return [];
    const college = colleges.find((item) => item._id === form.collegeId);
    return Array.isArray(college?.groups) ? college.groups : [];
  }, [colleges, form.collegeId]);

  async function loadColleges() {
    try {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      setColleges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
    }
  }

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (activeConfig.hasCollegeFilter && selectedCollegeId) params.set("collegeId", selectedCollegeId);
      if (search.trim()) params.set("search", search.trim());

      const query = params.toString();
      const res = await fetch(query ? `${activeConfig.endpoint}?${query}` : activeConfig.endpoint);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed to fetch ${entity}`);
      setRecords(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [activeConfig.endpoint, activeConfig.hasCollegeFilter, selectedCollegeId, search, entity, setRecords, setError, setLoading]);

  function openCreateForm() {
    setEditingRecord(null);
    setForm({
      ...INITIAL_FORM,
      collegeId: selectedCollegeId || colleges[0]?._id || "",
    });
    setShowForm(true);
    setMessage("");
    setError("");
  }

  function openEditForm(record) {
    setEditingRecord(record);
    setForm({
      ...INITIAL_FORM,
      ...record,
      collegeId: record.collegeId?._id || record.collegeId || selectedCollegeId || "",
      dob: record.dob ? toDateInput(record.dob) : "",
      dateOfJoining: record.dateOfJoining ? toDateInput(record.dateOfJoining) : "",
      groups: Array.isArray(record.groups) ? record.groups.join(", ") : "",
      password: "",
    });
    setShowForm(true);
    setMessage("");
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingRecord(null);
    setForm(INITIAL_FORM);
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const endpoint = editingRecord ? `${activeConfig.endpoint}/${editingRecord._id}` : activeConfig.endpoint;
    const method = editingRecord ? "PUT" : "POST";
    const payload = buildPayload(entity, form, Boolean(editingRecord));

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed to ${editingRecord ? "update" : "create"} record`);
      setMessage(result.message || "Saved successfully");
      closeForm();
      await fetchRecords();
      if (entity === "colleges") await loadColleges();
    } catch (err) {
      console.error(err);
      setError(err.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(record) {
    if (!window.confirm(`Delete ${record.name}?`)) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${activeConfig.endpoint}/${record._id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Delete failed");
      setMessage(result.message || "Deleted successfully");
      await fetchRecords();
      if (entity === "colleges") await loadColleges();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    }
  }

  if (status === "loading") {
    return <div className="p-8 text-center text-slate-600">Checking admin session...</div>;
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-600">Admin access required.</div>;
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-cyan-50 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-cyan-100 bg-white/90 px-5 py-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Platform Control</p>
                <h1 className="text-2xl font-black text-slate-900">Admin Panel</h1>
                <p className="text-sm text-slate-600">Manage colleges, students, lecturers, and principals from one place.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/setup" className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100">
                <ShieldPlus className="h-4 w-4" />
                Admin Setup
              </Link>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">{user?.name}</div>
                <div>{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Entities</p>
            <div className="space-y-2">
              {Object.entries(ENTITY_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const active = key === entity;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setEntity(key);
                      setShowForm(false);
                      setEditingRecord(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${active ? "border-cyan-300 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/70"}`}
                  >
                    <span className="flex items-center gap-3 font-semibold">
                      <Icon className="h-5 w-5" />
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">Live Summary</div>
              <p className="mt-1">{summary}</p>
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeConfig.label} Management</h2>
                  <p className="text-sm text-slate-600">Create, update, and remove {activeConfig.label.toLowerCase()} records.</p>
                </div>
                <button type="button" onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-700">
                  <UserPlus className="h-4 w-4" />
                  Add {activeConfig.label.slice(0, -1)}
                </button>
              </div>

              <div className={`mt-4 grid gap-3 ${activeConfig.hasCollegeFilter ? "md:grid-cols-[1fr_220px]" : "md:grid-cols-1"}`}>
                <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${activeConfig.label.toLowerCase()}...`} className="w-full bg-transparent text-sm outline-none" />
                </label>

                {activeConfig.hasCollegeFilter && (
                  <select value={selectedCollegeId} onChange={(event) => setSelectedCollegeId(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                    <option value="">All Colleges</option>
                    {colleges.map((college) => (
                      <option key={college._id} value={college._id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {message && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            </section>

            {showForm && (
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{editingRecord ? `Edit ${activeConfig.label.slice(0, -1)}` : `Create ${activeConfig.label.slice(0, -1)}`}</h3>
                    <p className="text-sm text-slate-600">Fill in the required details and save changes.</p>
                  </div>
                  <button type="button" onClick={closeForm} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {activeConfig.fields.map((field) => (
                      <Field
                        key={field.name}
                        field={{
                          ...field,
                          required: editingRecord && field.name === "password" ? false : field.required,
                          label: editingRecord && field.name === "password" ? "New Password (optional)" : field.label,
                        }}
                        value={form[field.name] ?? ""}
                        colleges={colleges}
                        groupOptions={selectedCollegeGroups}
                        onChange={handleFieldChange}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={submitting} className="rounded-2xl bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70">
                      {submitting ? "Saving..." : editingRecord ? "Update Record" : "Create Record"}
                    </button>
                    <button type="button" onClick={closeForm} className="rounded-2xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      {activeConfig.columns.map((column) => (
                        <th key={column.label} className="px-4 py-3 font-semibold">{column.label}</th>
                      ))}
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={activeConfig.columns.length + 1} className="px-4 py-10 text-center text-slate-500">Loading {activeConfig.label.toLowerCase()}...</td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={activeConfig.columns.length + 1} className="px-4 py-10 text-center text-slate-500">No records found.</td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record._id} className="border-t border-slate-100 align-top">
                          {activeConfig.columns.map((column) => (
                            <td key={column.label} className="px-4 py-3 text-slate-700">{column.render ? column.render(record) : record[column.key] || "-"}</td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => openEditForm(record)} className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50">Edit</button>
                              <button type="button" onClick={() => handleDelete(record)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ field, value, onChange, colleges, groupOptions = [] }) {
  const commonProps = {
    name: field.name,
    value,
    onChange,
    required: field.required,
    className: "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400",
  };

  if (field.type === "textarea") {
    return (
      <label className="md:col-span-2 xl:col-span-3 text-sm font-medium text-slate-700">
        {field.label}
        <textarea {...commonProps} rows={3} />
      </label>
    );
  }

  if (field.type === "select") {
    const options = field.name === "collegeId"
      ? colleges.map((college) => ({ value: college._id, label: college.name }))
      : field.name === "group" && groupOptions.length
        ? groupOptions.map((option) => ({ value: option, label: option }))
        : (field.options || []).map((option) => ({ value: option, label: option }));

    return (
      <label className="text-sm font-medium text-slate-700">
        {field.label}
        <select {...commonProps}>
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="text-sm font-medium text-slate-700">
      {field.label}
      <input {...commonProps} type={field.type || "text"} />
    </label>
  );
}

function buildPayload(entity, form, isEdit) {
  const payload = {
    collegeId: form.collegeId,
    name: form.name,
    email: form.email,
    password: form.password,
    subject: form.subject,
    photo: form.photo,
    fatherName: form.fatherName,
    mobile: form.mobile,
    admissionNo: form.admissionNo,
    group: form.group,
    yearOfStudy: form.yearOfStudy,
    gender: form.gender,
    caste: form.caste,
    status: form.status,
    admissionYear: form.admissionYear,
    dob: form.dob || undefined,
    dateOfJoining: form.dateOfJoining || undefined,
    address: form.address,
    code: form.code,
    district: form.district,
    contactEmail: form.contactEmail,
    contactPhone: form.contactPhone,
  };

  if (isEdit && !payload.password) delete payload.password;

  if (entity === "colleges") {
    delete payload.collegeId;
    delete payload.email;
    delete payload.password;
    delete payload.subject;
    delete payload.photo;
    delete payload.fatherName;
    delete payload.mobile;
    delete payload.admissionNo;
    delete payload.group;
    delete payload.yearOfStudy;
    delete payload.gender;
    delete payload.caste;
    delete payload.status;
    delete payload.admissionYear;
    delete payload.dob;
    delete payload.dateOfJoining;
  } else if (entity !== "students") {
    delete payload.fatherName;
    delete payload.mobile;
    delete payload.admissionNo;
    delete payload.group;
    delete payload.yearOfStudy;
    delete payload.gender;
    delete payload.caste;
    delete payload.status;
    delete payload.admissionYear;
    delete payload.dob;
    delete payload.address;
    delete payload.code;
    delete payload.district;
    delete payload.contactEmail;
    delete payload.contactPhone;
  }

  if (entity === "lecturers") {
    delete payload.dateOfJoining;
  }

  if (entity === "principals") {
    delete payload.subject;
    delete payload.code;
    delete payload.district;
    delete payload.contactEmail;
    delete payload.contactPhone;
    delete payload.address;
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === "" || payload[key] === undefined) delete payload[key];
  });

  return payload;
}

function toDateInput(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN");
}
