/// Admin Panel Page - Manage Colleges, Students, Lecturers, and Principals
//src/app/admin-panel/page.jsx
"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  Search,
  School,
  ShieldCheck,
  ShieldPlus,
  Trash2,
  Upload,
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
    accent: {
      badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
      button: "bg-cyan-600 hover:bg-cyan-700",
      soft: "from-cyan-500/20 via-sky-500/10 to-white",
      icon: "bg-cyan-500/15 text-cyan-700",
      activeCard: "border-cyan-300 bg-cyan-50 text-cyan-950 shadow-cyan-100",
    },
    bulkHeaders: ["Name", "Code", "Address", "District", "ContactEmail", "ContactPhone", "Groups"],
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
    accent: {
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      button: "bg-emerald-600 hover:bg-emerald-700",
      soft: "from-emerald-500/20 via-lime-500/10 to-white",
      icon: "bg-emerald-500/15 text-emerald-700",
      activeCard: "border-emerald-300 bg-emerald-50 text-emerald-950 shadow-emerald-100",
    },
    bulkHeaders: ["CollegeCode", "Name", "FatherName", "Mobile", "AdmissionNo", "Password", "Group", "YearOfStudy", "Gender", "Caste", "AdmissionYear", "DOB", "DateOfJoining", "Photo", "Address"],
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
    accent: {
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700",
      soft: "from-amber-500/20 via-orange-500/10 to-white",
      icon: "bg-amber-500/15 text-amber-700",
      activeCard: "border-amber-300 bg-amber-50 text-amber-950 shadow-amber-100",
    },
    bulkHeaders: ["CollegeCode", "Name", "Email", "Password", "Subject", "Photo"],
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
    accent: {
      badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
      button: "bg-indigo-600 hover:bg-indigo-700",
      soft: "from-indigo-500/20 via-blue-500/10 to-white",
      icon: "bg-indigo-500/15 text-indigo-700",
      activeCard: "border-indigo-300 bg-indigo-50 text-indigo-950 shadow-indigo-100",
    },
    bulkHeaders: ["CollegeCode", "Name", "Email", "Password", "DateOfJoining", "Photo"],
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

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AdminPanelPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const [entity, setEntity] = useState("colleges");
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE_OPTIONS[0],
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedIds, setSelectedIds] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [collegeAnalytics, setCollegeAnalytics] = useState({
    overview: null,
    colleges: [],
    monthWiseTrend: [],
    topPerformers: [],
    lowPerformers: [],
    groupDistribution: [],
    districtDistribution: [],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeConfig = ENTITY_CONFIG[entity];

  const summary = useMemo(() => {
    if (!pagination.total) return `No ${activeConfig.label.toLowerCase()} found`;
    return `${pagination.total} ${activeConfig.label.toLowerCase()} matched`;
  }, [pagination.total, activeConfig.label]);
  const filteredCollegeName = useMemo(
    () => colleges.find((item) => item._id === selectedCollegeId)?.name || "All colleges",
    [colleges, selectedCollegeId]
  );
  const entityStats = useMemo(
    () => [
      {
        label: "Visible Records",
        value: records.length,
        note: pagination.total ? `Page ${pagination.page} of ${pagination.totalPages}` : summary,
      },
      { label: "Colleges Connected", value: colleges.length, note: `${colleges.length ? "Directory synced" : "No colleges loaded yet"}` },
      {
        label: activeConfig.hasCollegeFilter ? "Current Scope" : "Panel Scope",
        value: activeConfig.hasCollegeFilter ? filteredCollegeName : "Global",
        note: activeConfig.hasCollegeFilter ? "Filter controls the list and form defaults" : "College data is managed globally",
      },
    ],
    [records.length, pagination.total, pagination.page, pagination.totalPages, summary, colleges.length, activeConfig.hasCollegeFilter, filteredCollegeName]
  );
  const rangeLabel = useMemo(() => {
    if (!pagination.total) return "Showing 0 records";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + records.length - 1, pagination.total);
    return `Showing ${start}-${end} of ${pagination.total}`;
  }, [pagination.page, pagination.limit, pagination.total, records.length]);
  const selectedCollegeGroups = useMemo(() => {
    if (!form.collegeId) return [];
    const college = colleges.find((item) => item._id === form.collegeId);
    return Array.isArray(college?.groups) ? college.groups : [];
  }, [colleges, form.collegeId]);
  const allVisibleSelected = useMemo(
    () => records.length > 0 && records.every((record) => selectedIds.includes(record._id)),
    [records, selectedIds]
  );

  const loadColleges = useCallback(async () => {
    try {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      setColleges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
    }
  }, []);

  const loadCollegeAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/colleges");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch college analytics");
      setCollegeAnalytics({
        overview: data.overview || null,
        colleges: Array.isArray(data.colleges) ? data.colleges : [],
        monthWiseTrend: Array.isArray(data.monthWiseTrend) ? data.monthWiseTrend : [],
        topPerformers: Array.isArray(data.topPerformers) ? data.topPerformers : [],
        lowPerformers: Array.isArray(data.lowPerformers) ? data.lowPerformers : [],
        groupDistribution: Array.isArray(data.groupDistribution) ? data.groupDistribution : [],
        districtDistribution: Array.isArray(data.districtDistribution) ? data.districtDistribution : [],
      });
    } catch (err) {
      console.error("Failed to fetch college analytics:", err);
    }
  }, []);

  const uploadToCloudinary = useCallback(async (file) => {
    const payload = new FormData();
    payload.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: payload,
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result.message || "Photo upload failed");
    }

    return result.url;
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (activeConfig.hasCollegeFilter && selectedCollegeId) params.set("collegeId", selectedCollegeId);
      if (deferredSearch.trim()) params.set("search", deferredSearch.trim());
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));

      const query = params.toString();
      const res = await fetch(query ? `${activeConfig.endpoint}?${query}` : activeConfig.endpoint);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed to fetch ${entity}`);
      setRecords(Array.isArray(result.data) ? result.data : []);
      setPagination({
        page: result.pagination?.page || currentPage,
        limit: result.pagination?.limit || pageSize,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 1,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load records");
      setRecords([]);
      setPagination({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  }, [activeConfig.endpoint, activeConfig.hasCollegeFilter, selectedCollegeId, deferredSearch, currentPage, pageSize, entity, setRecords, setError, setLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [entity, selectedCollegeId, deferredSearch, pageSize]);

  useEffect(() => {
    if (!isAdmin) return;
    loadColleges();
    loadCollegeAnalytics();
  }, [isAdmin, loadColleges, loadCollegeAnalytics]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchRecords();
  }, [isAdmin, fetchRecords]);

  useEffect(() => {
    if (pagination.totalPages > 0 && currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  useEffect(() => {
    setSelectedIds([]);
  }, [entity, records]);

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

  async function handlePhotoUpload(file) {
    if (!file) return;
    setPhotoUploading(true);
    setError("");
    setMessage("");

    try {
      const photoUrl = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, photo: photoUrl }));
      setMessage("Photo uploaded successfully");
    } catch (err) {
      console.error(err);
      setError(err.message || "Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
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
      await loadCollegeAnalytics();
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
      await loadCollegeAnalytics();
      if (entity === "colleges") await loadColleges();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    }
  }

  function toggleRecordSelection(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !records.some((record) => record._id === id));
      }
      const next = new Set(prev);
      records.forEach((record) => next.add(record._id));
      return [...next];
    });
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected ${activeConfig.label.toLowerCase()}?`)) return;

    setBulkActionLoading(true);
    setError("");
    setMessage("");
    setUploadResult(null);

    try {
      const res = await fetch(`/api/admin/bulk-delete/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Bulk delete failed");
      setMessage(result.message || "Selected records deleted");
      setSelectedIds([]);
      await fetchRecords();
      await loadCollegeAnalytics();
      if (entity === "colleges") await loadColleges();
    } catch (err) {
      console.error(err);
      setError(err.message || "Bulk delete failed");
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkUpload() {
    if (!uploadFile) {
      setError("Choose an .xlsx or .csv file first");
      return;
    }

    setBulkActionLoading(true);
    setError("");
    setMessage("");
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      if (selectedCollegeId) formData.append("collegeId", selectedCollegeId);

      const res = await fetch(`/api/admin/bulk-upload/${entity}`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Bulk upload failed");

      setMessage(result.message || "Bulk upload completed");
      setUploadResult(result);
      setUploadFile(null);
      await fetchRecords();
      await loadCollegeAnalytics();
      if (entity === "colleges") await loadColleges();
    } catch (err) {
      console.error(err);
      setError(err.message || "Bulk upload failed");
    } finally {
      setBulkActionLoading(false);
    }
  }

  function handleDownloadTemplate() {
    const csv = `${activeConfig.bulkHeaders.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${entity}-bulk-template.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (status === "loading") {
    return <div className="p-8 text-center text-slate-600">Checking admin session...</div>;
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-600">Admin access required.</div>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_45%,_#ecfeff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-slate-950 px-5 py-5 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.85)]">
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activeConfig.accent.soft}`} />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/12 p-3 text-white ring-1 ring-white/15 backdrop-blur">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Platform Control</p>
                <h1 className="text-2xl font-black text-white md:text-3xl">Admin Panel</h1>
                <p className="max-w-2xl text-sm text-slate-200">
                  Multi-college operations center for colleges, students, lecturers, and principals with one consistent workflow.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/setup" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                <ShieldPlus className="h-4 w-4" />
                Admin Setup
              </Link>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">
                <div className="font-semibold text-white">{user?.name}</div>
                <div className="text-slate-300">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {entityStats.map((item) => (
            <article key={item.label} className="rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{item.value}</div>
              <p className="mt-1 text-sm text-slate-600">{item.note}</p>
            </article>
          ))}
        </section>

        {entity === "colleges" && collegeAnalytics.overview && (
          <section className="grid gap-4">
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">College Analytics</h2>
                    <p className="text-sm text-slate-600">Platform-wide college capacity, staffing, and attendance health.</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <AnalyticsStatCard label="Total Colleges" value={collegeAnalytics.overview.totalColleges} hint="Registered institutions" />
                  <AnalyticsStatCard label="Total Students" value={collegeAnalytics.overview.totalStudents} hint={`${collegeAnalytics.overview.activeStudents} active, ${collegeAnalytics.overview.terminatedStudents} terminated`} />
                  <AnalyticsStatCard label="Teaching Staff" value={collegeAnalytics.overview.totalLecturers} hint={`${collegeAnalytics.overview.totalPrincipals} principals linked`} />
                  <AnalyticsStatCard label="Attendance Rate" value={`${collegeAnalytics.overview.overallAttendanceRate}%`} hint={`${collegeAnalytics.overview.totalAttendanceRecords} attendance records`} />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-slate-900">Top Colleges By Students</div>
                    <div className="space-y-3">
                      {collegeAnalytics.colleges.slice(0, 5).map((item) => {
                        const maxStudents = collegeAnalytics.colleges[0]?.students || 1;
                        return (
                          <div key={item.collegeId}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-slate-800">{item.name}</span>
                              <span className="text-slate-500">{item.students} students</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-200">
                              <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${Math.max((item.students / maxStudents) * 100, 8)}%` }} />
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {item.lecturers} lecturers, {item.principals} principals, {item.attendanceRate}% attendance
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-slate-900">District Spread</div>
                    <div className="space-y-3">
                      {collegeAnalytics.districtDistribution.map((item) => (
                        <div key={item.district} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm">
                          <span className="font-medium text-slate-700">{item.district}</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{item.count}</span>
                        </div>
                      ))}
                      {collegeAnalytics.districtDistribution.length === 0 && <div className="text-sm text-slate-500">No district data available.</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Group Distribution</h3>
                  <p className="text-sm text-slate-600">Current student strength by academic group across colleges.</p>
                </div>
                <div className="space-y-3">
                  {collegeAnalytics.groupDistribution.map((item) => {
                    const maxGroups = collegeAnalytics.groupDistribution[0]?.count || 1;
                    return (
                      <div key={item.group}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-800">{item.group}</span>
                          <span className="text-slate-500">{item.count}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-200">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max((item.count / maxGroups) * 100, 10)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {collegeAnalytics.groupDistribution.length === 0 && <div className="text-sm text-slate-500">No group analytics available yet.</div>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">College Health Snapshot</div>
                  <div className="space-y-3">
                    {collegeAnalytics.colleges.slice(0, 4).map((item) => (
                      <div key={item.collegeId} className="rounded-2xl bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.code} • {item.district}</div>
                          </div>
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {item.groupsCount} groups
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <span>Active: {item.activeStudents}</span>
                          <span>Terminated: {item.terminatedStudents}</span>
                          <span>FY: {item.firstYearStudents}</span>
                          <span>SY: {item.secondYearStudents}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">Last attendance: {formatDateTime(item.lastAttendanceDate)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Month-Wise Attendance Trend</h3>
                    <p className="text-sm text-slate-600">Last 6 months attendance rate across all colleges.</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    6 months
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-6 gap-3">
                  {collegeAnalytics.monthWiseTrend.map((item) => (
                    <div key={item.key} className="flex flex-col items-center gap-3">
                      <div className="flex h-44 w-full items-end rounded-2xl bg-slate-100 p-2">
                        <div
                          className="w-full rounded-xl bg-gradient-to-t from-cyan-500 to-sky-300"
                          style={{ height: `${Math.max(item.attendanceRate, 6)}%` }}
                          title={`${item.label}: ${item.attendanceRate}%`}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-slate-900">{item.attendanceRate}%</div>
                        <div className="text-xs text-slate-500">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.attendanceRecords} records</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Performance Highlights</h3>
                  <p className="text-sm text-slate-600">Top and low-performing colleges based on attendance rate.</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-emerald-900">Top Performers</div>
                  <div className="space-y-3">
                    {collegeAnalytics.topPerformers.map((item, index) => (
                      <PerformanceCard
                        key={`${item.collegeId}-top`}
                        rankLabel={`#${index + 1}`}
                        tone="good"
                        title={item.name}
                        subtitle={`${item.code} • ${item.activeStudents} active students`}
                        value={`${item.attendanceRate}%`}
                      />
                    ))}
                    {collegeAnalytics.topPerformers.length === 0 && <div className="text-sm text-emerald-800">No top performer data yet.</div>}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-amber-900">Needs Attention</div>
                  <div className="space-y-3">
                    {collegeAnalytics.lowPerformers.map((item, index) => (
                      <PerformanceCard
                        key={`${item.collegeId}-low`}
                        rankLabel={`#${index + 1}`}
                        tone="warn"
                        title={item.name}
                        subtitle={`${item.code} • ${item.activeStudents} active students`}
                        value={`${item.attendanceRate}%`}
                      />
                    ))}
                    {collegeAnalytics.lowPerformers.length === 0 && <div className="text-sm text-amber-800">No low performer data yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
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
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? `${config.accent.activeCard} shadow-lg`
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`rounded-xl p-2 ${active ? "bg-white/70" : "bg-white"} shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold">{config.label}</span>
                        <span className="block text-xs opacity-75">
                          {config.hasCollegeFilter ? "College-aware records" : "Core organization settings"}
                        </span>
                      </span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                      {key === entity ? "Active" : "Open"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
              <div className="font-semibold text-white">Live Summary</div>
              <p className="mt-1">{summary}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                {activeConfig.hasCollegeFilter ? `Scoped to ${filteredCollegeName}` : "Applies across the platform"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${activeConfig.accent.badge}`}>
                    {activeConfig.label} Workspace
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">{activeConfig.label} Management</h2>
                  <p className="text-sm text-slate-600">Create, update, and remove {activeConfig.label.toLowerCase()} records without leaving this page.</p>
                </div>
                <button type="button" onClick={openCreateForm} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-semibold text-white shadow-lg transition ${activeConfig.accent.button}`}>
                  <UserPlus className="h-4 w-4" />
                  Add {activeConfig.label.slice(0, -1)}
                </button>
              </div>

              <div className={`mt-4 grid gap-3 ${activeConfig.hasCollegeFilter ? "md:grid-cols-[1fr_240px]" : "md:grid-cols-1"}`}>
                <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner shadow-slate-100/70">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${activeConfig.label.toLowerCase()}...`} className="w-full bg-transparent text-sm outline-none" />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>

                {activeConfig.hasCollegeFilter && (
                  <select value={selectedCollegeId} onChange={(event) => setSelectedCollegeId(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none shadow-inner shadow-slate-100/70">
                    <option value="">All Colleges</option>
                    {colleges.map((college) => (
                      <option key={college._id} value={college._id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{rangeLabel}</div>
                  <div>{deferredSearch ? `Search active for "${deferredSearch}"` : "Search matches update automatically as you type."}</div>
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Rows</span>
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option} / page
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900">Bulk Actions</div>
                    <p className="text-sm text-slate-600">
                      Upload `.xlsx` or `.csv` files using the template headers. {activeConfig.hasCollegeFilter && !selectedCollegeId ? "For shared imports include CollegeCode in the file, or pick one college filter first." : "Current filter will be used as the default college scope when needed."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {activeConfig.bulkHeaders.map((header) => (
                        <span key={header} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold">
                          {header}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 xl:min-w-[420px]">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label className="flex-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <span className="mb-2 block font-semibold text-slate-900">Choose file</span>
                        <input
                          type="file"
                          accept=".xlsx,.csv"
                          onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                          className="block w-full text-sm"
                        />
                      </label>
                      <div className="flex flex-col gap-2 sm:w-[180px]">
                        <button type="button" onClick={handleDownloadTemplate} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                          <Download className="h-4 w-4" />
                          Template
                        </button>
                        <button type="button" onClick={handleBulkUpload} disabled={bulkActionLoading || !uploadFile} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                          <Upload className="h-4 w-4" />
                          {bulkActionLoading ? "Uploading..." : "Bulk Upload"}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-900">{selectedIds.length}</span> selected on this workspace
                      </div>
                      <button type="button" onClick={handleBulkDelete} disabled={bulkActionLoading || !selectedIds.length} className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                        <Trash2 className="h-4 w-4" />
                        {bulkActionLoading ? "Working..." : `Delete Selected (${selectedIds.length})`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {message && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {uploadResult && (
                <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                  <div className="font-semibold">
                    Inserted {uploadResult.insertedCount || 0}, skipped {uploadResult.skippedCount || 0}
                  </div>
                  {Array.isArray(uploadResult.errors) && uploadResult.errors.length > 0 && (
                    <div className="mt-1 text-xs text-sky-900">
                      {uploadResult.errors.length} row issues returned. First issue: {JSON.stringify(uploadResult.errors[0])}
                    </div>
                  )}
                </div>
              )}
            </section>

            {showForm && (
              <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
                <div className={`h-1.5 bg-gradient-to-r ${activeConfig.accent.soft}`} />
                <div className="p-4">
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
                        onPhotoUpload={handlePhotoUpload}
                        photoUploading={photoUploading}
                      />
                    ))}
                  </div>

                  {entity === "colleges" && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">Group Preview</div>
                      <p className="mt-1 text-sm text-slate-600">Separate groups with commas. These values will be used in student and attendance flows for that college.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(form.groups || "")
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item) => (
                            <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                              {item}
                            </span>
                          ))}
                        {!form.groups.trim() && <span className="text-sm text-slate-500">No custom groups entered yet.</span>}
                      </div>
                    </div>
                  )}

                  {entity !== "colleges" && form.collegeId && selectedCollegeGroups.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">Groups For Selected College</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedCollegeGroups.map((item) => (
                          <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={submitting} className="rounded-2xl bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70">
                      {submitting ? "Saving..." : editingRecord ? "Update Record" : "Create Record"}
                    </button>
                    <button type="button" onClick={closeForm} className="rounded-2xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                </form>
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeConfig.label} Directory</h3>
                  <p className="text-sm text-slate-600">Browse the current records and open any entry for quick edits.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {pagination.total} total
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAllVisible}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </th>
                      {activeConfig.columns.map((column) => (
                        <th key={column.label} className="px-4 py-3 font-semibold">{column.label}</th>
                      ))}
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={activeConfig.columns.length + 2} className="px-4 py-10 text-center text-slate-500">Loading {activeConfig.label.toLowerCase()}...</td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={activeConfig.columns.length + 2} className="px-4 py-10 text-center text-slate-500">No records found.</td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr key={record._id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/80">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(record._id)}
                              onChange={() => toggleRecordSelection(record._id)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>
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
              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                <div>{rangeLabel}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={loading || currentPage <= 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <div className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                    Page {pagination.page} / {pagination.totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                    disabled={loading || currentPage >= pagination.totalPages}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ field, value, onChange, colleges, groupOptions = [], onPhotoUpload, photoUploading = false }) {
  const commonProps = {
    name: field.name,
    value,
    onChange,
    required: field.required,
    className: "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:bg-white",
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

  if (field.name === "photo") {
    return (
      <label className="text-sm font-medium text-slate-700">
        {field.label}
        <input {...commonProps} type="text" placeholder="Photo URL" />
        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Upload an image to Cloudinary or paste an existing URL.
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
              {photoUploading ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onPhotoUpload?.(event.target.files?.[0] || null)}
                disabled={photoUploading}
              />
            </label>
          </div>
          {value && (
            <img
              src={value}
              alt="Uploaded preview"
              className="mt-3 h-28 w-28 rounded-2xl border border-slate-200 object-cover"
            />
          )}
        </div>
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

function AnalyticsStatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{hint}</div>
    </div>
  );
}

function PerformanceCard({ rankLabel, tone, title, subtitle, value }) {
  const toneClass = tone === "good"
    ? "border-emerald-200 bg-white text-emerald-700"
    : "border-amber-200 bg-white text-amber-700";

  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${toneClass}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{rankLabel}</div>
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>
      <div className="text-lg font-black">{value}</div>
    </div>
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
    groups: form.groups,
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
    delete payload.groups;
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
    delete payload.groups;
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

function formatDateTime(value) {
  if (!value) return "No attendance yet";
  return new Date(value).toLocaleString("en-IN");
}


