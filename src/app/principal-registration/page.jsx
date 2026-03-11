//app/principal-registration/page.jsx

"use client";

import { useState, useEffect } from "react";

export default function PrincipalRegistrationForm() {
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    collegeId: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(""); // ఫోటో preview కోసం

  useEffect(() => {
    const fetchColleges = async () => {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      setColleges(data);
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ఫోటో ఫైల్ ఎంచుకున్నప్పుడు state లో ఉంచడం
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      // ఈ స్థాయిలో మీరు ఆప్షనల్‌గా ఫోటో ప్రివ్యూ చూపించుకోవచ్చు
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result.toString());
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FormData ఆబ్జెక్ట్ సృష్టించండి multipart/form-data కోసం
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("collegeId", formData.collegeId);

    if (photoFile) {
      data.append("photo", photoFile);
    }

    try {
      const res = await fetch("/api/principals", {
        method: "POST",
        body: data, // Content-Type will be set automatically
      });

      if (res.ok) {
        window.location.href = "/principal/login";
      } else {
        const errorData = await res.json();
        alert("❌ Registration failed: " + (errorData.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4 mt-24"
    >
      <h2 className="text-xl font-bold text-center">👨‍💼 Principal Registration</h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
        value={formData.name}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        value={formData.email}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        value={formData.password}
        className="w-full border px-3 py-2 rounded"
        required
      />

      {/* College Dropdown */}
      <select
        name="collegeId"
        value={formData.collegeId}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      >
        <option value="">Select College</option>
        {colleges.map((college) => (
          <option key={college._id} value={college._id}>
            {college.name}
          </option>
        ))}
      </select>

      {/* Photo file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full"
      />

      {/* Photo preview */}
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Photo preview"
          className="w-32 h-32 object-cover rounded mx-auto mt-2"
        />
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Register
      </button>

      login{" "}
      <a href="/principal/login" className="text-blue-600">
        here
      </a>
    </form>
  );
}
