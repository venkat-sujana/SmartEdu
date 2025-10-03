//app/register/page.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Home } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RegisterPage() {



const { data: session } = useSession();
console.log("SESSION: ", session);

const [collegeId, setCollegeId] = useState('');
const [collegeName, setCollegeName] = useState('');

  
  useEffect(() => {
    if (session?.user?.collegeId) {
      setCollegeId(session.user.collegeId);
    }
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName);
    }
  }, [session]);


  const [photo, setPhoto] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    mobile: "",
    group: "",
    caste: "",
    dob: "",
    gender: "",
    admissionNo: "",
    yearOfStudy: "",
    admissionYear: "",
    dateOfJoining: "",
    address: "",
    photo: null,
    password: ""           // <-- password field add చేయండి
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();



  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!session?.user?.collegeId) {
      toast.error("Session expired. Please login again.");
      return;
    }


  // Password లేకపోతే default password ఇక్కడ set చేయండి
  const password = formData.password || "";
const passwordToSend = password.trim() === "" ? "Welcome@2025" : password;

    const form = new FormData();
    form.append("name", formData.name);
    form.append("fatherName", formData.fatherName);
    form.append("mobile", formData.mobile);
    form.append("group", formData.group);
    form.append("caste", formData.caste);
    form.append("dob", formData.dob);
    form.append("gender", formData.gender);
    form.append("admissionNo", formData.admissionNo);
    form.append("yearOfStudy", formData.yearOfStudy);
    form.append("admissionYear", formData.admissionYear);
    form.append("dateOfJoining", formData.dateOfJoining);
    form.append("address", formData.address);

    form.append("collegeId", collegeId); // ✅ Add this line to send collegeId  not in formData
    form.append("lecturerId", session.user.id); // ✅ Add lecturerId from session

    if (photo) {
      form.append("photo", photo);
    }

  // Password పంపండి (plain text)
  form.append("password", passwordToSend);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        body: form, // ✅ Correct formData sent here
      });

      const result = await res.json(); // ✅ No duplicate parsing
      console.log(result);

      if (res.ok) {
        toast.success("Student registered successfully👍✅");
        router.push("/register"); // ✅ Redirect to student table

        // Reset the form
        setFormData({
          name: "",
          fatherName: "",
          mobile: "",
          group: "",
          caste: "",
          dob: "",
          gender: "",
          admissionNo: "",
          admissionYear: "",
          yearOfStudy: "",
          dateOfJoining: "",
          address: "",
          password: ""  ,         // <-- password field reset చేయండి
        });
        setPhoto(null);
      } else {
        toast.error("Error: " + result.message);
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error("Submit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Link href="/student-table">
        {/* Home Button */}
        <button
          className="bg-green-600
         text-white 
         px-4 py-2 mb-4 
         font-bold  
         rounded absolute top-4
          right-10 hover:bg-blue-700 
          transition cursor-pointer
           
           border-b-2"
        >
          <Home className="inline mr-2" size={21} color="yellow" /> Student Table
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
      <div className="max-w-2xl mx-auto mt-10 bg-gray-100 shadow-lg rounded-xl p-6 font-bold border-x-black border-x-2 border-t-2 border-b-2 border-t-blue-600 border-b-blue-600">
        {/* College Name Display */}


<div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
  <span className="font-semibold">🏫</span> {collegeName || "Loading..."}
</div>


      

        <h2 className="text-xl font-bold mb-4 text-white bg-teal-600 text-center">
          🧑‍🎓🧑‍🎓&nbsp;Student Admission Form-2025
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Column 1 */}

          <div className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-2 border rounded-md "
              required
            />

 <div>
  <label className="text-sm text-gray-600">Password (Default:Welcome@2025)</label>
  <input
    type="password"
    name="password"
    placeholder="Enter Password or leave blank for default"
    value={formData.password}
    onChange={handleChange}
    className="w-full p-2 border rounded-md"
  />
</div>





            <input
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Father's Name"
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              className="w-full p-2 border rounded-md"
              required
            />
            <select
              name="group"
              value={formData.group}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Group</option>
              <option value="MPC">MPC</option>
              <option value="BiPC">BiPC</option>
              <option value="CEC">CEC</option>
              <option value="HEC">HEC</option>
              <option value="M&AT">M&AT</option>
              <option value="MLT">MLT</option>
              <option value="CET">CET</option>
            </select>
            <select
              name="caste"
              value={formData.caste}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Caste</option>
              <option value="OC">OC</option>
              <option value="OBC">OBC</option>
              <option value="BC-A">BC-A</option>
              <option value="BC-B">BC-B</option>
              <option value="BC-C">BC-C</option>
              <option value="BC-D">BC-D</option>
              <option value="BC-E">BC-E</option>
              <option value="SC">SC</option>
              <option value="SC-A">SC-A</option>
              <option value="SC-B">SC-B</option>
              <option value="SC-C">SC-C</option>
              <option value="ST">ST</option>
              <option value="OTHER">OTHER</option>
            </select>
            <div>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Column 2 */}
          <div className="space-y-1">
            <div>
              <label className="text-sm text-gray-600">Admission Number</label>
              <input
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                placeholder="Admission Number"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Year of Study</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
            </select>

            <div>
              <label className="text-sm text-gray-600">Admission Year</label>
              <input
                type="number"
                name="admissionYear"
                value={formData.admissionYear}
                onChange={handleChange}
                placeholder="Admission Year"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Date of joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                placeholder="Joining Date"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>


            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full p-2 border rounded-md"
              rows={4}
              required
            />
            <div>
              <label className="text-sm text-gray-600">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {/* Submit Button - Full Width */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-teal-950 text-white py-2 rounded hover:bg-blue-700 transition duration-200 cursor-pointer"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
