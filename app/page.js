import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen p-24 flex flex-col items-center justify-center">
      {/* Register Button at top-right */}
      <div className="absolute top-4 right-4">
        <Link href="/register">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Register
          </button>
        </Link>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl font-bold">Welcome to OSRA</h1>
    </div>
  );
}

