//app/attendance-edit-form/page.jsx
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AttendanceEditForm = ({ record, onClose, onUpdate }) => {
  const [status, setStatus] = useState("Absent");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
      console.log("EDIT RECORD:", record);
    if (record?.status) {
      setStatus(record.status);
    } else {
      setStatus("Absent");
    }
  }, [record]);

  const handleUpdate = async () => {
    if (!record) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Updating attendance...");

    const payload = {
  status,
  date: record.date,
  studentId: record.studentId?._id || record.studentId,
  group: record.group,
  yearOfStudy: record.yearOfStudy, // ✅
  session: record.session,
};

    try {
      const response = await fetch(`/api/attendance/${record._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success("Attendance updated!");
        onUpdate();
        onClose();
      } else {
        toast.error(result.message || "Failed to update");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Error updating attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!record) return null;

  return (
    <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-blue-700">Edit Attendance</h2>

        <p className="mb-2">
          <strong>Student:</strong> {record?.student || "N/A"} {/* ✅ */}
        </p>

        <p className="mb-2">
          <strong>Group:</strong> {record?.group || 'N/A'}
        </p>

        <p className="mb-2">
  <strong>Year:</strong> {record?.yearOfStudy || "N/A"} {/* ✅ */}
</p>

        <p className="mb-4">
          <strong>Date:</strong>{' '}
          {record.date ? new Date(record.date).toLocaleDateString() : 'No Date'}
        </p>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setStatus('Present')}
            className={`rounded-md px-4 py-2 ${
              status === 'Present' ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setStatus('Absent')}
            className={`rounded-md px-4 py-2 ${
              status === 'Absent' ? 'bg-red-600 text-white' : 'bg-gray-300'
            }`}
          >
            Absent
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-500 px-4 py-2 text-white"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
            disabled={isSubmitting}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
};

export default AttendanceEditForm;
