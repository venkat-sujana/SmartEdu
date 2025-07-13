"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrincipalRegister() {
  const router = useRouter();
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    collegeId: "",
    photo: "", // Cloudinary URL
  });
  const [uploading, setUploading] = useState(false);


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



  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setUploading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
   

    if (data.success) {
      setFormData((prev) => ({ ...prev, photo: data.url }));
    } else {
      alert("Upload failed");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/principal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Principal registered successfully");
      router.push("/principal/login");
    } else {
      alert(result.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Principal Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          onChange={handleChange}
          type="email"
          placeholder="Email"
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="password"
          onChange={handleChange}
          type="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded"
        />

        <select
          name="collegeId"
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select College</option>
          {colleges.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="w-full p-2 border rounded"
        />
        {uploading && <p className="text-blue-500 text-sm">Uploading...</p>}
        {formData.photo && (
          <img
            src={formData.photo}
            alt="Uploaded"
            className="w-24 h-24 rounded object-cover border"
          />
        )}

        <button
          type="submit"
          disabled={!formData.photo}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}





