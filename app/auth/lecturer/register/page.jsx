// app/auth/lecturer/register/page.jsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LecturerRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    role: "lecturer",
    photo: null,
    collegeId: ""
  })

  const [colleges, setColleges] = useState([]) // ✅ ఇది ముఖ్యమైనది
  const [error, setError] = useState("")
  const router = useRouter()

useEffect(() => {
  const fetchColleges = async () => {
    console.log("Fetching colleges...");
    try {
      const res = await fetch("/api/colleges");
      console.log("Response:", res);
      const data = await res.json();
      console.log("Fetched colleges:", data); // ✅ Console check
      setColleges(data);
    } catch (error) {
      console.error("College fetch failed:", error); // ❌ Log if error
    }
  };

  fetchColleges();
}, []);


const handleChange = (e) => {
  if (e.target.name === "photo") {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result, // ✅ this will be base64 string
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  } else {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  console.log("Form submission started with data:", form);

  try {
    const res = await fetch("/api/register/lecturer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    console.log("Response received:", res);
    const data = await res.json();
    console.log("Response data:", data);

    if (!res.ok) {
      console.error("Registration failed:", data.error || "Unknown error");
      setError(data.error || "Registration failed");
      return;
    }

    console.log("Registration Successful:", data);
    router.push("/auth/lecturer/login");
  } catch (error) {
    console.error("Registration error:", error);
    setError("Something went wrong");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4" encType="multipart/form-data">
        <h2 className="text-2xl font-bold text-center">Lecturer Registration</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input type="text" name="name" placeholder="Name" className="w-full px-4 py-2 border rounded"
          onChange={handleChange} required />

        <input type="email" name="email" placeholder="Email" className="w-full px-4 py-2 border rounded"
          onChange={handleChange} required />

        <input type="password" name="password" placeholder="Password" className="w-full px-4 py-2 border rounded"
          onChange={handleChange} required />
          <input
  type="text"
  name="subject"
  placeholder="Subject"
  className="w-full px-4 py-2 border rounded"
  onChange={handleChange}
  value={form.subject}
  required
/>


        {/* ✅ College Dropdown */}
<select
  name="collegeId"
  value={form.collegeId}
  onChange={handleChange}
  required
  className="w-full px-4 py-2 border rounded"
>
  <option value="">Select College</option>
  {colleges.map((college) => (
    <option key={college._id} value={college._id}>
      {college.name}
    </option>
  ))}
</select>


        <input type="file" name="photo" accept="image/*" className="w-full" onChange={handleChange} required />

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  )
}
