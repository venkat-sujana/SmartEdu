"use client";

export default function Toast({ message, show }) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg font-semibold">
        {message}
      </div>
    </div>
  );
}
