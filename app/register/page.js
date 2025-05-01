// app/register/page.js
//https://osra.vercel.app/
"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    group: "",
    caste: "",
    dob: "",
    gender: "",
    admissionYear: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Student Registered Successfully ✅");
      setFormData({
        name: "",
        mobile: "",
        group: "",
        caste: "",
        dob: "",
        gender: "",
        admissionYear: "",
        address: "",
      });
    } else {
      alert("Error: " + data.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Student Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" required />

        <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" className="w-full p-2 border rounded" required />

        <select name="group" value={formData.group} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Select Group</option>
          <option value="MPC">MPC</option>
          <option value="BiPC">BiPC</option>
          <option value="CEC">CEC</option>
          <option value="HEC">HEC</option>
          <option value="MEC">MEC</option>
          <option value="M&AT">M&AT</option>
          <option value="MLT">MLT</option>
          <option value="CET">CET</option>
        </select>

        <select name="caste" value={formData.caste} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Select Caste</option>
          <option value="OC">OC</option>
          <option value="BC-A">BC-A</option>
          <option value="BC-B">BC-B</option>
          <option value="BC-C">BC-C</option>
          <option value="BC-D">BC-D</option>
          <option value="BC-E">BC-E</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="Others">Others</option>
        </select>

        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded" required />

        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input type="number" name="admissionYear" value={formData.admissionYear} onChange={handleChange} placeholder="Admission Year" className="w-full p-2 border rounded" required />

        <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded" required />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Register Student
        </button>
      </form>
    </div>
  );
}
