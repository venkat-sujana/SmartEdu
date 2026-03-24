"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bot, Send, Loader2 } from "lucide-react";

export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { data: session } = useSession();
  const collegeId = session?.user?.collegeId;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        inputRef.current.scrollHeight + "px";
    }
  }, [input]);

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim() || loading || !collegeId || !mounted) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.content,
          collegeId,
        }),
      });

      const data = await response.json();

      const aiMessage = {
        id: Date.now().toString(),
        role: "ai",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: "❌ Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen max-w-4xl mx-auto flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-2xl">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Attendance Assistant</h1>
            <p className="text-sm text-gray-500">
              Ask about attendance, absentees, reports
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <Bot className="mx-auto h-16 w-16 mb-4 opacity-30" />
            <p>Ask something like:</p>
            <p className="text-sm mt-2">Show today attendance</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xl p-4 rounded-2xl shadow ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border"
              }`}
            >
              {/* ✅ RENDER LOGIC */}
              {typeof message.content === "string" ? (
                <p className="whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : message.content?.type === "attendance" ? (
                <div className="space-y-3">

                  <h3 className="font-bold text-lg">
                    📊 Attendance Summary
                  </h3>

                  {/* CARDS */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-100 p-2 rounded-xl">
                      <p className="text-xs">Present</p>
                      <p className="font-bold text-green-600">
                        {message.content.data.present}
                      </p>
                    </div>

                    <div className="bg-red-100 p-2 rounded-xl">
                      <p className="text-xs">Absent</p>
                      <p className="font-bold text-red-600">
                        {message.content.data.absent}
                      </p>
                    </div>

                    <div className="bg-blue-100 p-2 rounded-xl">
                      <p className="text-xs">Total</p>
                      <p className="font-bold text-blue-600">
                        {message.content.data.total}
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${message.content.data.presentPercent}%`,
                      }}
                    />
                  </div>

                  {/* ABSENTEES */}
                  <div>
                    <p className="text-sm font-semibold text-red-500">
                      🚫 Absentees:
                    </p>

                    <ul className="text-sm mt-1 space-y-1">
                      {message.content.data.absentees.map(
                        (s, i) => (
                          <li key={i}>
                            • {s.name} ({s.group})
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              ) : null}

              {/* TIME */}
              <p className="text-xs mt-2 opacity-60">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin h-4 w-4" />
            AI is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="border-t p-4 bg-white flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask something..."
          className="flex-1 resize-none border rounded-xl p-3 text-sm"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-3 rounded-xl"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}