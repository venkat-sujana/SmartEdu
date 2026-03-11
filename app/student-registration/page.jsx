"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function StudentRegistration() {
  const [formData, setFormData] = useState({
    admissionNo: "",
    name: "",
    email: "",
    password: "",
    year: "",
    group: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.admissionNo.trim()) nextErrors.admissionNo = "Admission number is required";
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      nextErrors.name = "Name must be at least 3 characters";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.year) nextErrors.year = "Select year";
    if (!formData.group) nextErrors.group = "Select group";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const checkDuplicateAdmissionNo = async (admissionNo) => {
    const res = await fetch(`/api/register/student?admissionNo=${encodeURIComponent(admissionNo)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.exists);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const isDuplicate = await checkDuplicateAdmissionNo(formData.admissionNo.trim());
      if (isDuplicate) {
        setErrors((prev) => ({
          ...prev,
          admissionNo: "Admission number already exists",
        }));
        toast.error("Admission number already exists");
        return;
      }

      // Keep existing logic as requested
      console.log("Student Registered:", formData);
      toast.success("Student registered successfully!");
    } catch (error) {
      toast.error("Unable to verify admission number. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-emerald-100 via-blue-100 to-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">🎓 Student Registration</h2>

        <input
          type="text"
          name="admissionNo"
          placeholder="Admission No"
          value={formData.admissionNo}
          className={`w-full px-4 py-2 border rounded-md ${errors.admissionNo ? "border-red-500" : ""}`}
          onChange={handleChange}
          required
        />
        {errors.admissionNo && <p className="text-sm text-red-600">{errors.admissionNo}</p>}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          className={`w-full px-4 py-2 border rounded-md ${errors.name ? "border-red-500" : ""}`}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          className={`w-full px-4 py-2 border rounded-md ${errors.email ? "border-red-500" : ""}`}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          className={`w-full px-4 py-2 border rounded-md ${errors.password ? "border-red-500" : ""}`}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        <select
          name="year"
          value={formData.year}
          className={`w-full px-4 py-2 border rounded-md ${errors.year ? "border-red-500" : ""}`}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
        </select>
        {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
        <select
          name="group"
          value={formData.group}
          className={`w-full px-4 py-2 border rounded-md ${errors.group ? "border-red-500" : ""}`}
          onChange={handleChange}
          required
        >
          <option value="">Select Group</option>
          <option value="MPC">MPC</option>
          <option value="BIPC">BIPC</option>
          <option value="CEC">CEC</option>
          <option value="HEC">HEC</option>
        </select>
        {errors.group && <p className="text-sm text-red-600">{errors.group}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        alreadty have an account? <a href="/lecturer/login" className="text-blue-600 hover:underline">Login here</a>

      </form>

    </div>
  );
}
