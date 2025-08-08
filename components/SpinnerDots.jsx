// components/FullPageSpinnerDots.jsx

export default function FullPageSpinnerDots() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
