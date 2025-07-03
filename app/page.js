import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen p-6 md:p-24 flex flex-col items-center justify-center bg-gray-100">
      {/* Button Cards */}
      <div className="absolute top-2 right-4 flex flex-col md:flex-row gap-2">
        <div className="bg-white p-1 rounded-lg shadow-md border border-gray-300 mb-4">
          <Link href="/register">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
              📝&nbsp;Admission Form
            </button>
          </Link>
        </div>

        {/* <div className="bg-white p-1 rounded-lg shadow-md border border-gray-300 mb-4">
          <Link href="/admin">
            <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition cursor-pointer font-bold">
              👤&nbsp; Admin
            </button>
          </Link>
        </div> */}

        {/* <div className="bg-white p-1 rounded-lg shadow-md border border-gray-300 mb-4">
        <Link href="/login">
          <button className="w-full bg-slate-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            📝&nbsp; Caretaker Login
          </button>
        </Link>
        </div> */}

        <div className="bg-white p-1 rounded-lg shadow-md border border-gray-300 mb-4">
        <Link href="/college-registration">
          <button className="w-full bg-slate-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            📝&nbsp; College Registration
          </button>
        </Link>
        </div>

        <div className="bg-white p-1 rounded-lg shadow-md border border-gray-300 mb-4">
        <Link href="/lecturer-login">
          <button className="w-full bg-slate-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            📝&nbsp; Lecturer Login
          </button>
        </Link>
        </div>

        <div className="bg-white p-1 rounded-lg shadow-md border border-gray-300 mb-4">
        <Link href="/lecturer-registration">
          <button className="w-full bg-slate-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            📝&nbsp; Lecturer Registration
          </button>
        </Link>
        </div>


      </div>

      {/* Main Heading */}
      <div>
        <Image
          src="/images/skrlogo.png"
          alt="OSRA Logo"
          width={600}
          height={600}
          className="mt-20 border-2 border-gray-300 rounded-lg shadow-lg"
          priority
        />
      </div>

      <h1 className="text-4xl text-black font-bold mt-2">
        Welcome to 🧑‍🏫&nbsp;OSRA
      </h1>
      <h2 className="text-2xl text-black font-semibold mt-4">
        Online Student Registration & Analysis
      </h2>

      <p className="text-lg mt-4  text-left text-black max-w-2xl">
        🏫 <strong>OSRA</strong> – Online Student Registration & Analysis OSRA
        is a modern, full-stack web application designed to streamline student
        registration, attendance tracking, and examination analysis for Junior
        Colleges.
        <br />
        Developed using <strong>Next.js</strong> and{" "}
        <strong>Tailwind CSS</strong>, <strong>OSRA</strong> empowers lecturers
        and administrators to efficiently manage student data, academic
        performance, and attendance across academic years and streams.
      </p>

      <strong>
        <p className="text-md mt-3 text-black flex items-center justify-left gap-2">
          🔑 Key Features:
          <br />
          <br /> 📝 Student Registration: Easy-to-use form for registering
          students with personal details, photos, and stream allocation
          (General/Vocational). <br />
          <br />
          📅 Attendance Management: Track daily, monthly, and year-wise
          attendance; generate printable attendance summaries.
          <br />
          <br /> 🧮 Exam Management: Enter subject-wise marks for each exam type
          (Unit, Quarterly, Half-Yearly, Pre-Public); <br />
          calculate totals, percentages, and pass/fail status based on dynamic
          rules.
          <br />
          <br /> 📊 Performance Reports: Generate A4-format profiles with photo,
          attendance, and exam summaries; exportable as PDF. <br />
          <br />
          🔒 Lecturer Login: Secure access for lecturers with individual profile
          photo support.
          <br />
          <br /> ☁️ Cloud Integration: Cloudinary used for managing student and
          lecturer photos.
        </p>
      </strong>

      <strong>
        {" "}
        <p className="text-md mt-3 flex items-center justify-left text-black">
          🎯 Why OSRA?
          <br /> Simplifies administrative tasks in government junior colleges.
          Offers real-time, visual insights into student performance.
          <br />
          <br />
          Reduces paperwork and enhances digital record-keeping. Tailored for
          both General (MPC, BiPC, CEC, HEC) and Vocational (MLT, M&AT, CET)
          streams.
        </p>
      </strong>

      <p className="text-lg mt-4 text-center text-black">
        <a
          href="https://github.com/venkat-sujana/osra"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
        >
          📂 View Source on GitHub
        </a>
      </p>
    </div>
  );
}
