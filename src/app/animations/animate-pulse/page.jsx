export default function AnimatePulse() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-4 text-xl text-blue-600 font-semibold animate-pulse">
        please wait, Redirecting To Lecturer Dashboard ...
      </span>
    </div>
  );
}