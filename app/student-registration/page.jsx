"use client";

import { useState } from "react";

export default function StudentRegistration() {
  const [formData, setFormData] = useState({
    admissionNo: "",
    name: "",
    email: "",
    password: "",
    year: "",
    group: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Student Registered:", formData);
    alert("Student registered successfully!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-100 via-blue-100 to-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">🎓 Student Registration</h2>

        <input
          type="text"
          name="admissionNo"
          placeholder="Admission No"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <select
          name="year"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
        </select>
        <select
          name="group"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
          required
        >
          <option value="">Select Group</option>
          <option value="MPC">MPC</option>
          <option value="BIPC">BIPC</option>
          <option value="CEC">CEC</option>
          <option value="HEC">HEC</option>
        </select>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition"
        >
          Register
        </button>
        alreadty have an account? <a href="/lecturer/login" className="text-blue-600 hover:underline">Login here</a>

      </form>

    </div>
  );
}
