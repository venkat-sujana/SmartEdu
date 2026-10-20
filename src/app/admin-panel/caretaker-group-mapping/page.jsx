
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Save,
  Users,
} from 'lucide-react';

function getList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.colleges)) return payload.colleges;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export default function CaretakerGroupMappingPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [lecturers, setLecturers] = useState([]);
  const [collegeGroups, setCollegeGroups] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadColleges = useCallback(async () => {
    setLoadingColleges(true);
    setError('');

    try {
      const response = await fetch('/api/colleges', {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Colleges లోడ్ కాలేదు.');
      }

      const list = getList(payload);
      setColleges(list);

      if (list.length === 0) {
        setError('Colleges ఏవీ అందుబాటులో లేవు.');
      }
    } catch (err) {
      setError(err.message || 'Colleges లోడ్ చేయడంలో సమస్య.');
    } finally {
      setLoadingColleges(false);
    }
  }, []);

  const loadMappings = useCallback(async (collegeId) => {
    if (!collegeId) {
      setLecturers([]);
      setCollegeGroups([]);
      return;
    }

    setLoadingMappings(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/admin/caretaker-group-mappings?collegeId=${encodeURIComponent(collegeId)}`,
        { cache: 'no-store' }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error || 'Lecturer mappings లోడ్ కాలేదు.'
        );
      }

      setLecturers(
        (payload.lecturers || []).map((lecturer) => ({
          ...lecturer,
          groups: Array.isArray(lecturer.groups)
            ? lecturer.groups
            : [],
        }))
      );

      setCollegeGroups(
        Array.isArray(payload.college?.groups)
          ? payload.college.groups
          : []
      );
    } catch (err) {
      setLecturers([]);
      setCollegeGroups([]);
      setError(err.message || 'Mapping వివరాలు పొందలేకపోయాం.');
    } finally {
      setLoadingMappings(false);
    }
  }, []);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  useEffect(() => {
    loadMappings(selectedCollege);
  }, [selectedCollege, loadMappings]);

  function toggleGroup(lecturerId, group, checked) {
    setSuccess('');

    setLecturers((current) =>
      current.map((lecturer) => {
        if (lecturer._id !== lecturerId) return lecturer;

        const groups = checked
          ? [...new Set([...lecturer.groups, group])]
          : lecturer.groups.filter((item) => item !== group);

        return { ...lecturer, groups };
      })
    );
  }

  async function saveMapping(lecturer) {
    if (!selectedCollege) {
      setError('ముందుగా College ఎంపిక చేయండి.');
      return;
    }

    if (lecturer.groups.length === 0) {
      setError(
        `${lecturer.name} కు కనీసం ఒక Group కేటాయించాలి.`
      );
      return;
    }

    setSavingId(lecturer._id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        '/api/admin/caretaker-group-mappings',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeId: selectedCollege,
            lecturerId: lecturer._id,
            groups: lecturer.groups,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error || 'Mapping సేవ్ కాలేదు.'
        );
      }

      setLecturers((current) =>
        current.map((item) =>
          item._id === lecturer._id
            ? {
                ...item,
                groups: payload.data?.groups || lecturer.groups,
                isMapped: true,
                updatedAt: payload.data?.updatedAt || new Date().toISOString(),
              }
            : item
        )
      );

      setSuccess(
        `${lecturer.name} కు Group Mapping విజయవంతంగా సేవ్ అయింది.`
      );
    } catch (err) {
      setError(err.message || 'Mapping సేవ్ చేయడంలో సమస్య.');
    } finally {
      setSavingId('');
    }
  }

  const mappedCount = lecturers.filter(
    (lecturer) => lecturer.isMapped && lecturer.groups.length > 0
  ).length;

  const unmappedCount = lecturers.length - mappedCount;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                <GraduationCap size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Caretaker Group Mapping
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Lecturers కు ఒకటి లేదా అంతకంటే ఎక్కువ Groups కేటాయించండి.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadMappings(selectedCollege)}
            disabled={!selectedCollege || loadingMappings}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loadingMappings ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="college"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Select College
          </label>

          <select
            id="college"
            value={selectedCollege}
            onChange={(event) => setSelectedCollege(event.target.value)}
            disabled={loadingColleges}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:max-w-xl"
          >
            <option value="">
              {loadingColleges ? 'Loading colleges...' : '-- Select College --'}
            </option>

            {colleges.map((college) => (
              <option key={college._id} value={college._id}>
                {college.name || college.collegeName || 'Unnamed College'}
              </option>
            ))}
          </select>
        </section>

        {selectedCollege && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Total Lecturers</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {lecturers.length}
                </p>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-sm text-green-700">Mapped Lecturers</p>
                <p className="mt-2 text-3xl font-bold text-green-800">
                  {mappedCount}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm text-amber-700">Pending Mapping</p>
                <p className="mt-2 text-3xl font-bold text-amber-800">
                  {unmappedCount}
                </p>
              </div>
            </section>

            {loadingMappings ? (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-12 text-slate-600">
                <LoaderCircle size={22} className="animate-spin" />
                Loading lecturer mappings...
              </div>
            ) : lecturers.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <Users
                  size={38}
                  className="mx-auto mb-3 text-slate-400"
                />
                <h2 className="font-semibold text-slate-800">
                  Lecturers not found
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ఈ College కు Lecturers నమోదు అయ్యారో తనిఖీ చేయండి.
                </p>
              </div>
            ) : (
              <section className="space-y-4">
                {lecturers.map((lecturer) => (
                  <article
                    key={lecturer._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">
                            {lecturer.name}
                          </h2>

                          {lecturer.isMapped && lecturer.groups.length > 0 ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                              Mapped
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              Not Mapped
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {lecturer.email || 'No email'} 
                          {lecturer.subject ? ` • ${lecturer.subject}` : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => saveMapping(lecturer)}
                        disabled={
                          savingId === lecturer._id ||
                          lecturer.groups.length === 0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingId === lecturer._id ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}
                        {savingId === lecturer._id ? 'Saving...' : 'Save Mapping'}
                      </button>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Assign Groups
                      </p>

                      {collegeGroups.length === 0 ? (
                        <p className="text-sm text-amber-700">
                          ఈ College కు Groups అందుబాటులో లేవు. College settings తనిఖీ చేయండి.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {collegeGroups.map((group) => {
                            const checked = lecturer.groups.includes(group);

                            return (
                              <label
                                key={group}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                  checked
                                    ? 'border-teal-300 bg-teal-50'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) =>
                                    toggleGroup(
                                      lecturer._id,
                                      group,
                                      event.target.checked
                                    )
                                  }
                                  className="h-4 w-4 accent-teal-600"
                                />
                                <span className="text-sm font-medium text-slate-800">
                                  {group}
                                </span>
                                {checked && (
                                  <Check
                                    size={15}
                                    className="ml-auto text-teal-700"
                                  />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        Selected: {lecturer.groups.length} group(s). కనీసం ఒక Group ఎంచుకుని Save చేయండి.
                      </p>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
