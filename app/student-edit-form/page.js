//app/student-edit-form/page.js

"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const StudentEditForm = ({ student, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    name: student?.name || "",
    fatherName: student?.fatherName || "",
    mobile: student?.mobile || "",
    group: student?.group || "",
    caste: student?.caste || "",
    dob: student?.dob || "",
    gender: student?.gender || "",
    admissionNo: student?.admissionNo || "",
    admissionYear: student?.admissionYear || "",
    address: student?.address || "",
    photo: student?.photo || "",
    file: null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const [collegeId, setCollegeId] = useState('');
  const [collegeName, setCollegeName] = useState('');

  useEffect(() => {
    if (session?.user?.collegeId) {
      setCollegeId(session.user.collegeId);
    }
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName);
    }
  }, [session]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prev) => ({
        ...prev,
        file: files[0],
        photo: files[0] ? URL.createObjectURL(files[0]) : prev.photo,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "osra-preset"); // ✅ unsigned preset
  
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dlwxpzc83/image/upload", true);
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url); // ✅ return uploaded image URL
        } else {
          reject(new Error("Upload failed"));
        }
      };
  
      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(formData);
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let photoUrl = formData.photo;

      if (formData.file) {
        try {
          toast.loading("ఫోటో అప్‌లోడ్ అవుతోంది...");
          const uploadedUrl = await uploadToCloudinary(formData.file);
          photoUrl = uploadedUrl; // ✅ Fixed here
          toast.dismiss();
          toast.success("ఫోటో విజయవంతంగా అప్‌లోడ్ అయింది");
        } catch (err) {
          toast.dismiss();
          toast.error("ఫోటో అప్‌లోడ్ విఫలమైంది");
          return;
        }
      }

      const updateData = {
        name: formData.name,
        fatherName: formData.fatherName,
        mobile: formData.mobile,
        group: formData.group,
        caste: formData.caste,
        dob: formData.dob,
        gender: formData.gender,
        admissionNo: formData.admissionNo,
        admissionYear: formData.admissionYear,
        address: formData.address,
        photo: photoUrl,
        _id: student._id,
      };

      const res = await fetch(`/api/students/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedStudent = await res.json();
      onSave(updatedStudent);
      toast.success("విద్యార్థి వివరాలు విజయవంతంగా అప్డేట్ చేయబడ్డాయి");
    } catch (err) {
      toast.error("అప్డేట్ విఫలమైంది: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md border space-y-6 w-full max-w-3xl mx-auto"
>
  <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
  <span className="font-semibold">🏫</span> {collegeName || "Loading..."}
</div>

      <h2 className="text-xl font-semibold text-gray-800">Edit Student Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="input-field"
        />
        <input
          name="fatherName"
          value={formData.fatherName}
          onChange={handleChange}
          placeholder="Father's Name"
          className="input-field"
        />
        <input
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="Mobile"
          className="input-field"
        />
        <input
          name="group"
          value={formData.group}
          onChange={handleChange}
          placeholder="Group"
          className="input-field"
        />
        <input
          name="caste"
          value={formData.caste}
          onChange={handleChange}
          placeholder="Caste"
          className="input-field"
        />
        <input
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          placeholder="Date of Birth"
          className="input-field"
        />
        <input
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          placeholder="Gender"
          className="input-field"
        />
        <input
          name="admissionNo"
          value={formData.admissionNo}
          onChange={handleChange}
          placeholder="Admission Number"
          className="input-field"
        />
        <input
          name="admissionYear"
          value={formData.admissionYear}
          onChange={handleChange}
          placeholder="Admission Year"
          className="input-field"
        />
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="input-field"
        />
        <div className="col-span-full">
          <input
            type="file"
            name="file"
            onChange={handleChange}
            className="file-input w-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={isUploading}
        >
          {isUploading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StudentEditForm;
