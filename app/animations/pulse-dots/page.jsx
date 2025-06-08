// Pulse Dots
export default function PulseDots() {
  return (
    <div className="min-h-screen flex justify-center items-center space-x-2">
      <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
      <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-150"></div>
      <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-300"></div>
      <span className="ml-4 text-xl text-blue-600 font-semibold animate-pulse">
        please wait, Redirecting To Student Info ...
      </span>
    </div>
  );
}