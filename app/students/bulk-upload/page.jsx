"use client";

import { useState } from "react";
import Toast from "../../components/Toast";

export default function BulkUploadStudents() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const handleUpload = async () => {
    if (!file) return alert("Please select Excel file");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/students/bulk-upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    // Show toast on success
    setToast({ show: true, message: data.message });

    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  return (
    <div className="p-6 max-w-xl mx-auto mt-20 border rounded shadow">
      <Toast message={toast.message} show={toast.show} />

      <h1 className="text-xl font-bold mb-4">Bulk Upload Students</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 rounded w-full cursor-pointer"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {loading ? "Uploading..." : "Upload Students"}
      </button>
    </div>
  );
}
