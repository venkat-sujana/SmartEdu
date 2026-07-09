//src/app/late-entry-register/page.jsx
"use client";
import { FileText } from "lucide-react";
import { exportLatePdf } from "@/utils/exportLatePdf";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Users,
  Clock3,
  RefreshCw,
} from "lucide-react";

function today() {
  return new Date().toISOString().split("T")[0];
}

function firstDayOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

export default function LateEntryRegisterPage() {
  const [loading, setLoading] = useState(false);

  const [records, setRecords] = useState([]);

  const [fromDate, setFromDate] = useState(firstDayOfMonth());

  const [toDate, setToDate] = useState(today());

  const [search, setSearch] = useState("");

  const { data: session } = useSession();

  const [group, setGroup] = useState("All");
  const [year, setYear] = useState("All");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [pagination, setPagination] = useState({
  page: 1,
  totalPages: 1,
  totalRecords: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
  `/api/attendance/late-register?from=${fromDate}&to=${toDate}&group=${group}&year=${year}&search=${search}&page=${page}&limit=${limit}`
);

      const data = await res.json();

      if (data.status === "success") {
        setRecords(data.data || []);
      } else {
        setRecords([]);
      }
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, group, year, search, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();

      return (
        r.studentName?.toLowerCase().includes(q) ||
        r.admissionNo?.toLowerCase().includes(q) ||
        r.group?.toLowerCase().includes(q) ||
        r.year?.toLowerCase().includes(q)
      );
    });
  }, [records, search]);

  const totalLate = filtered.length;

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
      {/* Header */}

      <div className="rounded-3xl bg-linear-to-r from-amber-500 to-orange-500 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-black sm:text-3xl">Late Entry Register</h1>

        <p className="mt-1 text-sm opacity-90">Daily Late Comers Register</p>
      </div>

      {/* Cards */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <Users className="text-blue-600" />

            <span className="text-xs text-slate-500">Total</span>
          </div>

          <h2 className="mt-3 text-3xl font-black">{totalLate}</h2>

          <p className="text-sm text-slate-500">Late Entries</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <CalendarDays className="text-green-600" />

            <span className="text-xs text-slate-500">From</span>
          </div>

          <p className="mt-3 font-bold">{fromDate}</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <Clock3 className="text-amber-600" />

            <span className="text-xs text-slate-500">To</span>
          </div>

          <p className="mt-3 font-bold">{toDate}</p>
        </div>
      </div>

      {/* Filters */}

      <div className="mt-6 rounded-3xl bg-white p-5 shadow">
        <div className="grid gap-3 lg:grid-cols-9">
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="rounded-xl border p-3"
          />

          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="rounded-xl border p-3"
          />

          <div className="relative lg:col-span-2">
            <Search size={18} className="absolute top-3 left-3 text-slate-400" />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Student / Admission No / Group"
              className="w-full rounded-xl border py-3 pr-3 pl-10"
            />
          </div>
          <select
  value={group}
  onChange={(e) => {
    setPage(1);
    setGroup(e.target.value);
  }}
  className="rounded-xl border p-3"
>
  <option>All</option>
  <option>MPC</option>
  <option>BiPC</option>
  <option>CEC</option>
  <option>HEC</option>
  <option>CET</option>
  <option>M&AT</option>
  <option>MLT</option>
</select>

<select
  value={year}
  onChange={(e) => {
    setPage(1);
    setYear(e.target.value);
  }}
  className="rounded-xl border p-3"
>
  <option>All</option>
  <option>First Year</option>
  <option>Second Year</option>
</select>


<select
  value={limit}
  onChange={(e) => {
    setPage(1);
    setLimit(Number(e.target.value));
  }}
  className="rounded-xl border p-3"
>
  <option value={25}>25 Records</option>
  <option value={50}>50 Records</option>
  <option value={100}>100 Records</option>
</select>

          <button
            onClick={loadData}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={() =>
              exportLatePdf({
                records: filtered,
                fromDate,
                toDate,
                collegeName: session?.user?.collegeName || 'Government Junior College',
                academicYear: '2026-2027',
              })
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Mobile */}

      <div className="mt-6 space-y-4 lg:hidden">
        {loading && <div className="rounded-2xl bg-white p-8 text-center shadow">Loading...</div>}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow">No Late Entries Found</div>
        )}

        {filtered.map((item, index) => (
          <div key={index} className="rounded-3xl bg-white p-4 shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{item.studentName}</h3>

                <p className="text-sm text-slate-500">{item.admissionNo}</p>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                {item.lateTime}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <b>Group</b>
                <br />
                {item.group}
              </div>

              <div>
                <b>Year</b>
                <br />
                {item.year}
              </div>

              <div>
                <b>Date</b>
                <br />
                {new Date(item.date).toLocaleDateString()}
              </div>

              <div>
                <b>Lecturer</b>
                <br />
                {item.lecturer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}

      <div className="mt-6 hidden overflow-hidden rounded-3xl bg-white shadow lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>

                <th className="px-4 py-3 text-left">Admission No</th>

                <th className="px-4 py-3 text-left">Student</th>

                <th className="px-4 py-3 text-left">Group</th>

                <th className="px-4 py-3 text-left">Year</th>

                <th className="px-4 py-3 text-left">Late Time</th>

                <th className="px-4 py-3 text-left">Lecturer</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-amber-50">
                    <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>

                    <td className="px-4 py-3">{item.admissionNo}</td>

                    <td className="px-4 py-3 font-semibold">{item.studentName}</td>

                    <td className="px-4 py-3">{item.group}</td>

                    <td className="px-4 py-3">{item.year}</td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                        {item.lateTime}
                      </span>
                    </td>

                    <td className="px-4 py-3">{item.lecturer}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

       <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">

  <p className="text-sm text-slate-600">
    Total Records : <b>{pagination.totalRecords}</b>
  </p>

  <div className="flex items-center gap-2">

    <button
      disabled={page===1}
      onClick={()=>setPage(page-1)}
      className="rounded-lg border px-4 py-2 disabled:opacity-40"
    >
      Previous
    </button>

    <span className="rounded-lg bg-blue-600 px-4 py-2 text-white">

      {page} / {pagination.totalPages}

    </span>

    <button
      disabled={page===pagination.totalPages}
      onClick={()=>setPage(page+1)}
      className="rounded-lg border px-4 py-2 disabled:opacity-40"
    >
      Next
    </button>

  </div>

</div>



      </div>
    </div>
  )
}