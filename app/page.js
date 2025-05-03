import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen p-24 flex flex-col items-center justify-center bg-gray-100">
      {/* Register Button at top-right */}
      <div className="absolute top-4 right-4 bg-amber-50">
        <Link href="/register">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            Register
          </button>
        </Link>&nbsp;
         

        

        <Link href="/admin">
          {/* Admin Button */}
          <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer font-bold">
            Admin
          </button>
        </Link>


      </div>
       {/* Main Heading */}
      <h1 className="text-4xl font-bold">Welcome to OSRA</h1>
    </div>
  );
}

