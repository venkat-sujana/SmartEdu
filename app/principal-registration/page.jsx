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

  useEffect(() => {
    // API నుండి colleges తీసుకోవడం
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register/principal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        window.location.href = "/registration-success";
      } else {
        alert("❌ Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-bold text-center">👨‍💼 Principal Registration</h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      {/* 🔽 College Dropdown */}
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

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Register
      </button>
      login{" "}<a href="/principal/login" className="text-blue-600">here</a>
    </form>
  );
}
