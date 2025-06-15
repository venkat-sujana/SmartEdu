"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AttendanceEditForm = ({ record, onClose, onUpdate }) => {
  if (!record) return null;

  const [status, setStatus] = useState(record?.status || "Absent");
  const [isSubmitting, setIsSubmitting] = useState(false);

      useEffect(() => {
    console.log("Edit record:", record);
  }, [record]);

const handleUpdate = async () => {
  setIsSubmitting(true);
  const toastId = toast.loading("Updating attendance...");

  const payload = {
    status,
    date: record.date,
    student: record.student,
    group: record.group,
    year: record.year,
  };



  console.log("Sending update data:", payload); // 🪵 Debug log

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
      console.error("Update failed:", result);
      toast.error(result.message || "Failed to update");
    }
  } catch (error) {
    console.error("Update error:", error);
    toast.dismiss(toastId);
    toast.error("Error updating attendance");
  } finally {
    setIsSubmitting(false);
  }
};




  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">Edit Attendance</h2>

<p className="mb-2">
  <strong>Student:</strong> {record?.studentId || "N/A"}
</p>

<p className="mb-2">
  <strong>Group:</strong> {record?.group || "N/A"}
</p>

<p className="mb-2">
  <strong>Year:</strong> {record?.year || record?.yearOfStudy || "N/A"}
</p>

<p className="mb-4">
  <strong>Date:</strong> {record.date ? new Date(record.date).toLocaleDateString() : "No Date"}
</p>


        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setStatus("Present")}
            className={`px-4 py-2 rounded-md ${
              status === "Present" ? "bg-green-600 text-white" : "bg-gray-300"
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setStatus("Absent")}
            className={`px-4 py-2 rounded-md ${
              status === "Absent" ? "bg-red-600 text-white" : "bg-gray-300"
            }`}
          >
            Absent
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            disabled={isSubmitting}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceEditForm;
