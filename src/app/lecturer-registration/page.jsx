//app/lecturer-registration/page.jsx
'use client';
import { useEffect, useState } from 'react';
import SpinnerDots from "@/components/SpinnerDots";

export default function LecturerRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: '',
    subject: '',
    collegeName: '',
    photo: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await fetch('/api/colleges');
        const data = await res.json();
        setColleges(data);
      } catch (error) {
        console.error('Failed to load colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const uploadToCloudinary = async (file) => {
    const payload = new FormData();
    payload.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: payload,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Photo upload failed.');
    }

    return data.url;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoUrl = form.photo;

      if (photoFile) {
        setPhotoUploading(true);
        photoUrl = await uploadToCloudinary(photoFile);
      }

      const res = await fetch('/api/lecturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photo: photoUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "/registration-success";
        setForm({ name: '', email: '', password: '', collegeId: '', subject: '', collegeName: '', photo: '' });
        setPhotoFile(null);
        setPhotoPreview('');
      } else {
        alert(data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Registration failed.');
    } finally {
      setPhotoUploading(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative">
      {isLoading && <SpinnerDots />}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700">🎓 Lecturer Registration</h2>

        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Select College</label>
          <select
            name="collegeId"
            value={form.collegeId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="">-- Select College --</option>
            {colleges.map((college) => (
              <option key={college._id} value={college._id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Subject</label>
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="">-- Select Subject --</option>
            <option value="Maths">Maths</option>
            <option value="Physics">Physics</option>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
            <option value="Civics">Civics</option>
            <option value="Zoology">Zoology</option>
            <option value="Botany">Botany</option>
            <option value="Chemistry">Chemistry</option>
            <option value="MLT">MLT</option>
            <option value="Economics">Economics</option>
            <option value="History">History</option>
            <option value="Commerce">Commerce</option>
            <option value="MandAT">M&AT</option>
            <option value="CET">CET</option>
            <option value="GFC">GFC</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring focus:border-blue-500"
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Lecturer preview"
              className="mt-3 h-24 w-24 rounded-2xl object-cover border border-gray-200"
            />
          )}
          <p className="mt-2 text-xs text-gray-500">
            {photoUploading ? 'Uploading photo...' : 'Selected image will be uploaded to Cloudinary during registration.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || photoUploading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition disabled:opacity-70"
        >
          Register Lecturer
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/lecturer/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
        <p>
          if you don&apos;t have a college?{' '}<a href="/college-registration" className="text-blue-600 hover:underline">Register College</a> for your student
        </p>
      </form>
    </div>
  );
}
