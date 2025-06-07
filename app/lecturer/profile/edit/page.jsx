//app/lecturer/profile/edit/page.jsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function EditLecturerProfile() {
  const [lecturer, setLecturer] = useState(null);
  const [form, setForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const decoded = jwtDecode(token);
    fetch(`/api/lecturers/${decoded.id}`)
      .then((res) => res.json())
      .then((data) => {
        setLecturer(data.lecturer);
        setForm(data.lecturer);
        setPhotoPreview(data.lecturer.photo || "");
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handlePhotoUpload = async (e) => {
  console.log("handlePhotoUpload triggered");
  const file = e.target.files[0];
  if (!file) {
    console.log("No file selected");
    return;
  }

  // Validate file type and size if needed
  if (!file.type.match('image.*')) {
    console.log("Invalid file type");
    alert('Please select an image file');
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "gic-students");
  formData.append("folder", "lecturers");

  console.log("FormData contents:");
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  try {
    console.log("Starting file upload");
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dlwxpzc83/image/upload",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    );

    if (res.data.secure_url) {
      const imageUrl = res.data.secure_url;
      setPhotoPreview(imageUrl);
      setForm((prev) => ({ ...prev, photo: imageUrl }));
      console.log("✅ Upload success:", imageUrl);
    } else {
      console.error("No secure_url in response");
      throw new Error("No secure_url in response");
    }
  } catch (err) {
    console.error("❌ Upload failed:", err);
    const errorMessage = err.response?.data?.error?.message || 
                        err.message || 
                        "Unknown error occurred";
    alert("Upload failed: " + errorMessage);
  }
};




  const handleSubmit = async () => {
    const res = await fetch(`/api/lecturers/${lecturer._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
     

    });
  console.log("Submitting form:", form);

    if (res.ok) {
      alert("Profile updated successfully!");
      router.push("/lecturer/dashboard");
    } else {
      alert("Update failed");
    }
  };

  if (!lecturer) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow rounded-xl mt-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        ✏️ Edit Lecturer Profile
      </h2>

      {/* Photo Preview */}
      {photoPreview && (
        <img
          src={photoPreview}
          alt="Profile Preview"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-gray-300"
        />
      )}

      <label className="block mb-1 font-medium">Change Photo</label>
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="mb-4"
      />

      <label className="block mb-1 font-medium">Name</label>
      <input
        name="name"
        value={form.name || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block mb-1 font-medium">Subject</label>
      <input
        name="subject"
        value={form.subject || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block mb-1 font-medium">Mobile</label>
      <input
        name="mobile"
        value={form.mobile || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
      >
        Save Changes
      </button>
    </div>
  );
}
