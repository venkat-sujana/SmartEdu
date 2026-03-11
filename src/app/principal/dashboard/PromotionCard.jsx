"use client";

import { useEffect, useState } from "react";

export default function PromotionCard() {
  const [safeLoading, setSafeLoading] = useState(false);
  const [realLoading, setRealLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [autoStatus, setAutoStatus] = useState("");

  useEffect(() => {
    const runAuto = async () => {
      try {
        const res = await fetch("/api/students/promote/auto", { method: "POST" });
        const data = await res.json();
        if (data?.skipped) {
          setAutoStatus(data.reason || "Auto promotion skipped");
          return;
        }
        if (data?.message) {
          setAutoStatus(data.message);
          setResult({ ...data, mode: "AUTO" });
        }
      } catch {
        setAutoStatus("Auto promotion check failed");
      }
    };

    runAuto();
  }, []);

  const runSafeTestPromotion = async () => {
    setSafeLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/students/test-promotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      data.ranAt = new Date().toISOString();
      setResult({ ...data, mode: "SAFE-TEST" });
    } catch {
      setResult({ error: "Safe test promotion failed" });
    } finally {
      setSafeLoading(false);
    }
  };

  const runRealYearPromotion = async () => {
    setRealLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/students/promote", { method: "POST" });
      const data = await res.json();
      data.ranAt = new Date().toISOString();
      setResult({ ...data, mode: "REAL" });
    } catch {
      setResult({ error: "Real year promotion failed" });
    } finally {
      setRealLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4 rounded-xl border bg-white p-6 shadow-xl">
      <h2 className="text-xl font-semibold">Year Promotion Actions</h2>

      <button
        onClick={runSafeTestPromotion}
        disabled={safeLoading || realLoading}
        className={`w-full rounded-lg py-3 font-medium text-white ${
          safeLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {safeLoading ? "Processing..." : "Run Safe Test Promotion"}
      </button>

      <button
        onClick={runRealYearPromotion}
        disabled={safeLoading || realLoading}
        className={`w-full rounded-lg py-3 font-medium text-white ${
          realLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {realLoading ? "Processing..." : "Run Year Promotion (Real)"}
      </button>

      {autoStatus && <p className="text-xs text-gray-500">{autoStatus}</p>}

      {result && (
        <div
          className={`mt-4 rounded-xl p-4 text-sm ${
            result.error
              ? "bg-red-100 text-red-700"
              : result.mode === "SAFE-TEST"
              ? "bg-blue-100 text-blue-700"
              : result.mode === "AUTO"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <div>
              <p className="font-semibold">
                {result.mode === "SAFE-TEST"
                  ? "Safe Test Promotion Completed"
                  : result.mode === "AUTO"
                  ? "Auto Promotion Completed"
                  : "Real Year Promotion Completed"}
              </p>
              <p>Date: {new Date(result.ranAt).toLocaleString()}</p>
              <p>Promoted: {result.promoted}</p>
              <p>Terminated: {result.terminated}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
