"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MessageSquareWarning, Send } from "lucide-react";

export default function AttendanceSmsCard() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadPreview() {
      try {
        const res = await fetch("/api/attendance/shortage-summary/notify-parents");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load SMS preview");
        setPreview(data.data);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "SMS preview load failed");
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, []);

  async function handleSend() {
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/attendance/shortage-summary/notify-parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: 75 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send SMS");
      setResult(data.data);
      toast.success(data.message || "SMS sent successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "SMS sending failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Low Attendance SMS Alerts</h2>
          <p className="mt-1 text-sm text-slate-600">
            Attendance below 75% ఉన్న students parents కి SMS పంపడానికి ready flow.
          </p>
        </div>
        <div className="rounded-full bg-amber-100 p-3 text-amber-700">
          <MessageSquareWarning className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        {loading ? (
          <p>Loading SMS preview...</p>
        ) : (
          <>
            <p>
              Eligible students: <span className="font-semibold">{preview?.totalEligible || 0}</span>
            </p>
            <p>
              Valid mobile numbers: <span className="font-semibold">{preview?.validMobileCount || 0}</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Current contact source: <span className="font-semibold">{preview?.contactSource || "student.parentMobile"}</span>
            </p>
          <p className="mt-1 text-xs text-slate-500">
            Provider: <span className="font-semibold">{preview?.sms?.provider || "fast2sms"}</span> | Configured:{" "}
            <span className="font-semibold">{preview?.sms?.configured ? "Yes" : "No"}</span>
          </p>
            <p className="mt-1 text-xs text-slate-500">{preview?.note}</p>
            <p className="mt-1 text-xs text-slate-500">
              SMS content: English + Telugu bilingual message
            </p>
          </>
        )}
      </div>

      {preview?.preview?.length ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">Preview Recipients</div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {preview.preview.map((student) => (
              <div key={student.studentId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{student.name}</span>
                <span>{student.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSend}
        disabled={sending || loading || !preview?.sms?.configured}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {sending ? "Sending..." : "Send SMS To Low Attendance Parents"}
      </button>

      {!preview?.sms?.configured && !loading ? (
        <p className="mt-3 text-xs text-rose-600">
          FAST2SMS config missing. Add `SMS_PROVIDER=fast2sms` and `FAST2SMS_API_KEY` in env before sending.
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">
            Sent {result.sentCount}, failed {result.failedCount}, skipped {result.skippedCount}
          </p>
        </div>
      ) : null}
    </div>
  );
}
