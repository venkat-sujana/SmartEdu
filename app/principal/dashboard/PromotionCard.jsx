//app/principal/dashboard/PromotionCard.jsx

"use client";
import { useState } from "react";

export default function PromotionCard() {
  const [safeLoading, setSafeLoading] = useState(false);
  const [realLoading, setRealLoading] = useState(false);
  const [result, setResult] = useState(null);

  // SAFE TEST
  const runSafeTestPromotion = async () => {
    setSafeLoading(true);
    setResult(null);

    try {
      console.log("Running Safe Test Promotion...");
      const res = await fetch("/api/students/test-promotion", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            }
      });
      console.log("Safe Test Promotion Response:", res);
      const data = await res.json();
      console.log("Safe Test Promotion Data:", data);
      data.ranAt = new Date().toISOString();
      setResult({ ...data, mode: "SAFE-TEST" });
    } catch (e) {
      console.error("Safe Test Promotion Error:", e);
      setResult({ error: "Safe Test Promotion Failed" });
    } finally {
      console.log("Safe Test Promotion Finished");
      setSafeLoading(false);
    }
  };

  // REAL PROMOTION
  const runRealYearPromotion = async () => {
    setRealLoading(true);
    setResult(null);

    try {
      console.log("Running Real Year Promotion...");
      const res = await fetch("/api/students/promote", {
        method: "POST",
      });
      console.log("Received response from Real Year Promotion API:", res);
      const data = await res.json();
      console.log("Parsed response from Real Year Promotion API:", data);
      data.ranAt = new Date().toISOString();
      setResult({ ...data, mode: "REAL" });
      console.log("Real Year Promotion result:", result);
    } catch (e) {
      console.error("Real Year Promotion failed:", e);
      setResult({ error: "Real Year Promotion Failed" });
    } finally {
      console.log("Real Year Promotion finished");
      setRealLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border mt-6 space-y-4">

      <h2 className="text-xl font-semibold">🎓 Year Promotion Actions</h2>

      {/* SAFE TEST BUTTON */}
      <button
        onClick={runSafeTestPromotion}
        disabled={safeLoading || realLoading}
        className={`w-full py-3 rounded-lg font-medium text-white 
        ${safeLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
        {safeLoading ? "Processing…" : "Run Safe Test Promotion"}
      </button>

      {/* REAL PROMOTION BUTTON */}
      <button
        onClick={runRealYearPromotion}
        disabled={safeLoading || realLoading}
        className={`w-full py-3 rounded-lg font-medium text-white 
        ${realLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
        {realLoading ? "Processing…" : "Run Year Promotion (Real)"}
      </button>

      {/* RESULT BOX */}
      {result && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm ${
            result.error
              ? "bg-red-100 text-red-700"
              : result.mode === "SAFE-TEST"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {result.error ? (
            <p>❌ {result.error}</p>
          ) : (
            <div>
              <p className="font-semibold">
                ✔ {result.mode === "SAFE-TEST"
                  ? "Safe Test Promotion Completed!"
                  : "Real Year Promotion Completed!"}
              </p>
              <p>📅 Date: {new Date(result.ranAt).toLocaleString()}</p>
              <p>Promoted: {result.promoted}</p>
              <p>Terminated: {result.terminated}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
