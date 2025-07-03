//app/lecturer-registration/page.jsx
"use client";
import { useEffect, useState } from "react";
import router from "next/router";



export default function LecturerRegistrationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    subject: "",
    collegeId: "",
    collegeName: "",
  });

  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await fetch("/api/colleges");
        if (!res.ok) {
          throw new Error("Failed to fetch colleges");
        }
        const data = await res.json();
        setColleges(data);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  // ✅ Add all fields manually
  formData.append("name", form.name);
  formData.append("email", form.email);
  formData.append("mobile", form.mobile);
  formData.append("password", form.password);
  formData.append("subject", form.subject);
  formData.append("collegeId", form.collegeId); // ✅ send only ID
  // Don't append collegeName manually — backend will fetch using collegeId

  const res = await fetch("/api/lecturers", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
  if (res.ok) {
    alert("Lecturer registered successfully!");
    setForm({
      name: "",
      email: "",
      mobile: "",
      password: "",
      subject: "",
      collegeId: "",
    });
    router.push("/lecturer-login");
  } else {
    alert(result.message || "Something went wrong");
  }
};

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lecturer Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border p-2"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border p-2"
          required
        />
        <input
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Mobile"
          className="w-full border p-2"
          required
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          className="w-full border p-2"
          required
        />
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="w-full border p-2"
          required
        />

        <select
          name="collegeId"
          value={form.collegeId}
          onChange={handleChange}
          className="w-full border p-2"
          required
        >
          <option value="">-- Select College --</option>
          {colleges.map((clg) => (
            <option key={clg._id} value={clg._id}>
              {clg.name}
            </option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
