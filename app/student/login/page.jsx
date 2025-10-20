"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Send credentials exactly as expected in backend
    const res = await signIn("student-login", {
      redirect: false,
      admissionNo: admissionNo.trim(), // use .toLowerCase() ONLY if backend expects it
      password: password,
      callbackUrl: "/student/dashboard",
    });

    if (res?.error) {
      setError("Invalid credentials");
      console.log("SignIn Error:", res.error); // For debugging
    } else if (res?.url) {
      router.push(res.url);
    }
  };

  return (
 <div className="min-h-screen flex flex-col items-center justify-start bg-blue-500 pt-10 bg-[url('/images/bg-8.jpg')] bg-cover bg-center">
  <form className="bg-white p-4 rounded-xl shadow-md space-y-4 w-60 max-w-sm" onSubmit={handleSubmit}>
    <h1 className="text-xl font-bold text-center text-gray-800">Student Login</h1>
    {error && <div className="text-red-600 bg-red-50 p-2 rounded text-center">{error}</div>}
    <input
      type="text"
      placeholder="Admission No"
      value={admissionNo}
      onChange={(e) => setAdmissionNo(e.target.value)}
      className="w-full px-5 py-2 border rounded focus:ring-2 focus:ring-green-500"
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-5 py-2 border rounded focus:ring-2 focus:ring-green-500"
      required
    />
    <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
      Login
    </button>
    <p className="text-center text-sm text-gray-600">
      Don’t have an account?{" "}
      <a href="/student-activate" className="text-green-600 hover:underline">
        Activate your Account
      </a>
    </p>
  </form>
</div>


  );
}
