//Typing Dots
export default function TypingDots() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-gray-700 rounded-full"
            style={{
              animation: "typing 1.4s infinite ease-in-out",
              animationDelay: `${i * 0.2}s`,
            }}
          ></div>
        ))}
      </div>
      <style jsx>{`
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}