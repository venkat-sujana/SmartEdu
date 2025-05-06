"use client";
import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    mobile: "",
    group: "",
    caste: "",
    dob: "",
    gender: "",
    admissionYear: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Student Registered Successfully ✅");

        setFormData({
          name: "",
          fatherName: "",
          mobile: "",
          group: "",
          caste: "",
          dob: "",
          gender: "",
          admissionYear: "",
          address: "",
        });
      } else {
        toast.error("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Link href="/">
        {/* Dashboard Button */}
        <button className="bg-green-600 text-white px-4 py-2 mb-4 font-bold  rounded absolute top-4 right-10 hover:bg-blue-700 transition cursor-pointer">
          Home
        </button>
      </Link>
      &nbsp;
      {/* Full Page Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center  justify-center z-50">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <p className="text-blue-600 font-semibold text-xl">Registering...</p>
        </div>
      )}
      <div className="max-w-2xl mx-auto mt-10 bg-cyan-100 shadow-lg rounded-xl p-6 font-bold border-x-black border-x-2 border-t-2 border-b-2 border-t-blue-600 border-b-blue-600">
        <h1 className="text-lg font-bold mb-4 text-center  text-blue-600">
          S.K.R.GOVERNMENT JUNIOR COLLEGE-GUDUR
        </h1>
        <h2 className="text-xl font-bold mb-4 text-white bg-blue-600 text-center">
          <Users className="inline" color="white" />
          &nbsp;Student Admission Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-2 border rounded font-bold"
            required
          />
          <input
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Father's Name"
            className="w-full p-2 border rounded font-bold"
            required
          />

          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="w-full p-2 border rounded font-bold"
            required
          />

          <select
            name="group"
            value={formData.group}
            onChange={handleChange}
            className="w-full p-2 border rounded font-bold"
            required
          >
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

          <select
            name="caste"
            value={formData.caste}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Caste</option>
            <option value="OC">OC</option>
            <option value="BC-E">BC</option>
            <option value="BC-A">BC-A</option>
            <option value="BC-B">BC-B</option>
            <option value="BC-C">BC-C</option>
            <option value="BC-D">BC-D</option>
            <option value="BC-E">BC-E</option>
            <option value="BC-E">BC</option>
            <option value="BC-E">SC-A</option>
            <option value="BC-E">SC-B</option>
            <option value="SC">SC-C</option>
            <option value="ST">ST</option>
            <option value="Others">Others</option>
          </select>
          <label className="text-sm text-gray-600">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="number"
            name="admissionYear"
            value={formData.admissionYear}
            onChange={handleChange}
            placeholder="Admission Year"
            className="w-full p-2 border rounded"
            required
          />

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-2 border rounded font-bold"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer transition duration-200"
            disabled={isLoading}
          >
            <Users className="inline mr-2" /> {/* Icon */}
            Register Student
          </button>
        </form>
      </div>
    </div>
  );
}
