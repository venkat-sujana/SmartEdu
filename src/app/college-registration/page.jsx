//app/college-registration/page.jsx
"use client"
import { useState } from "react";
import Link from "next/link";
import LoginPage from "../login/page";
export default function CollegeRegistrationForm() {
  const [form, setForm] = useState({
    name: "", code: "", address: "", district: "",
    principalName: "", contactEmail: "", contactPhone: ""
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/colleges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    if (res.ok) alert("College registered successfully!");
    
    else alert(result.error || "Error occurred");
    setForm({
      name: "", code: "", address: "", district: "",
      principalName: "", contactEmail: "", contactPhone: ""
    });
  };

  return (
    <div className="max-w-xl mx-auto p-4">
     



      <h2 className="text-2xl font-bold mb-4">College Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" onChange={handleChange} placeholder="College Name" className="w-full border p-2" required />
        <input name="code" onChange={handleChange} placeholder="College Code" className="w-full border p-2" required />
        <input name="address" onChange={handleChange} placeholder="Address" className="w-full border p-2" />
        <input name="district" onChange={handleChange} placeholder="District" className="w-full border p-2" />
        <input name="principalName" onChange={handleChange} placeholder="Principal Name" className="w-full border p-2" />
        <input name="contactEmail" onChange={handleChange} placeholder="Email" className="w-full border p-2" />
        <input name="contactPhone" onChange={handleChange} placeholder="Phone" className="w-full border p-2" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Register College</button>

      </form>
     
        <p className="mt-4 text-center text-gray-600">
          Don't have an Lecturer account?{" "}
          <a href="/lecturer-registration" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
        <p className="mt-2 text-center text-gray-600"></p>
                <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/lecturer/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
        <p className="mt-2 text-center text-gray-600"></p>
     
    </div>
  );
}
