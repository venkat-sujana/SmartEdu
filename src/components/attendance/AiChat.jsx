"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bot, Send, Loader2, Sparkles, Users, TriangleAlert, CalendarDays, Mic } from "lucide-react";

const BASE_QUICK_PROMPTS = [
  "Show today attendance",
  "Who is absent today?",
  "Show monthly report",
  "List students with low attendance",
];

const TELUGU_QUICK_PROMPTS = [
  "ఈరోజు అటెండెన్స్ చూపించు",
  "ఈరోజు ఎవరు absent",
  "నెలవారీ అటెండెన్స్ చూపించు",
  "తక్కువ అటెండెన్స్ ఉన్నవాళ్లు చూపించు",
];

function parseAssistantResponse(content) {
  if (
    content &&
    typeof content === "object" &&
    content.type === "structured"
  ) {
    return {
      type: "structured",
      title: content.title || "Attendance Update",
      metrics: Array.isArray(content.metrics) ? content.metrics : [],
      bullets: Array.isArray(content.bullets) ? content.bullets : [],
      info: Array.isArray(content.info) ? content.info : [],
      detailTitle: content.detailTitle || "Details",
      sections: Array.isArray(content.sections) ? content.sections : [],
    };
  }

  if (typeof content !== "string") {
    return { type: "text", text: String(content ?? "") };
  }

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { type: "text", text: content };
  }

  const title = lines[0];
  const metrics = [];
  const bullets = [];
  const info = [];

  for (const line of lines.slice(1)) {
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
      continue;
    }

    const metricMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (metricMatch) {
      const [, label, value] = metricMatch;
      metrics.push({ label: label.trim(), value: value.trim() });
      continue;
    }

    info.push(line);
  }

  if (metrics.length > 0 || bullets.length > 0) {
    return {
      type: "structured",
      title,
      metrics,
      bullets,
      info,
      detailTitle: "Details",
      sections: [],
    };
  }

  return { type: "text", text: content };
}

function AssistantMessageBody({ content }) {
  const parsed = parseAssistantResponse(content);

  if (parsed.type === "text") {
    return <p className="whitespace-pre-wrap">{parsed.text}</p>;
  }

  const fnMetrics = parsed.metrics.filter((metric) => metric.label.startsWith("FN "));
  const anMetrics = parsed.metrics.filter((metric) => metric.label.startsWith("AN "));
  const otherMetrics = parsed.metrics.filter(
    (metric) =>
      !metric.label.startsWith("FN ") && !metric.label.startsWith("AN ")
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-blue-100 p-2 text-blue-600">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{parsed.title}</p>
          {parsed.info.map((line) => (
            <p key={line} className="mt-1 text-sm text-slate-600">
              {line}
            </p>
          ))}
        </div>
      </div>

      {(fnMetrics.length > 0 || anMetrics.length > 0) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {fnMetrics.length > 0 && (
            <SessionMetricCard
              title="FN Session"
              tone="blue"
              metrics={fnMetrics}
            />
          )}
          {anMetrics.length > 0 && (
            <SessionMetricCard
              title="AN Session"
              tone="emerald"
              metrics={anMetrics}
            />
          )}
        </div>
      )}

      {otherMetrics.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {otherMetrics.map((metric) => (
            <div
              key={`${metric.label}-${metric.value}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {parsed.sections?.length > 0 && (
        <div className="space-y-3">
          {parsed.sections.map((section) => (
            <ComparisonSection
              key={section.title}
              title={section.title}
              metrics={Array.isArray(section.metrics) ? section.metrics : []}
              rank={section.rank}
              badge={section.badge}
              highlight={section.highlight}
            />
          ))}
        </div>
      )}

      {parsed.bullets.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Users className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-800">
              {parsed.detailTitle || "Details"}
            </p>
          </div>
          <div className="space-y-2 px-4 py-3">
            {parsed.bullets.map((item) => (
              <div
                key={item}
                className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionMetricCard({ title, metrics, tone }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50"
      : "border-blue-200 bg-blue-50";

  return (
    <div className={`rounded-2xl border ${toneClass} p-4`}>
      <p className="mb-3 text-sm font-semibold text-slate-900">{title}</p>
      <div className="grid gap-2">
        {metrics.map((metric) => {
          const shortLabel = metric.label.replace(/^FN\s+|^AN\s+/, "");

          return (
            <div
              key={`${metric.label}-${metric.value}`}
              className="rounded-xl border border-white/70 bg-white px-3 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {shortLabel}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonSection({ title, metrics, rank, badge, highlight = "default" }) {
  const fnMetrics = metrics.filter((metric) => metric.label.startsWith("FN "));
  const anMetrics = metrics.filter((metric) => metric.label.startsWith("AN "));
  const otherMetrics = metrics.filter(
    (metric) =>
      !metric.label.startsWith("FN ") && !metric.label.startsWith("AN ")
  );

  const highlightClass =
    highlight === "success"
      ? "border-emerald-300 bg-emerald-50"
      : highlight === "warning"
        ? "border-amber-300 bg-amber-50"
        : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-2xl border p-4 ${highlightClass}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">
          #{rank || "-"} {title}
        </p>
        {badge && (
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
            {badge}
          </span>
        )}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {fnMetrics.length > 0 && (
          <SessionMetricCard title="FN Session" tone="blue" metrics={fnMetrics} />
        )}
        {anMetrics.length > 0 && (
          <SessionMetricCard title="AN Session" tone="emerald" metrics={anMetrics} />
        )}
      </div>
      {otherMetrics.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {otherMetrics.map((metric) => (
            <div
              key={`${metric.label}-${metric.value}`}
              className="rounded-xl border border-white/70 bg-white px-3 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const { data: session, status } = useSession();
  const collegeId = session?.user?.collegeId;
  const role = session?.user?.role;
  const quickPrompts =
    role === "principal"
      ? [...BASE_QUICK_PROMPTS, "Compare all groups today"]
      : BASE_QUICK_PROMPTS;
  const teluguQuickPrompts =
    role === "principal"
      ? [...TELUGU_QUICK_PROMPTS, "అన్ని గ్రూపులు compare చేయి"]
      : TELUGU_QUICK_PROMPTS;

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
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = "te-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async (customInput) => {
    const sourceInput =
      typeof customInput === "string" ? customInput : input;
    const nextInput = sourceInput.trim();
    if (!nextInput || loading || !collegeId || !mounted) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: nextInput,
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
          query: nextInput,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.response || data.error || "Something went wrong. Please try again."
        );
      }

      const aiMessage = {
        id: `${Date.now()}-ai`,
        role: "ai",
        content: data.response || "No response available.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "ai",
          content: error?.message || "Something went wrong. Please try again.",
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

  const toggleVoiceInput = () => {
    if (!recognitionRef.current || loading || !collegeId) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    setListening(true);
    recognitionRef.current.start();
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto flex h-screen max-w-xl flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="sticky top-0 z-10 border-b bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-2">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Attendance Assistant</h1>
            <p className="text-sm text-gray-500">
              Ask about attendance, absentees, and reports in English or Telugu
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="mt-20 text-center text-gray-500">
            <Bot className="mx-auto mb-4 h-16 w-16 opacity-30" />
            <p>Ask something like:</p>
            <p className="mt-2 text-sm">Show today attendance</p>
            <p className="mt-1 text-sm">ఈరోజు అటెండెన్స్ చూపించు</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading || status === "loading" || !collegeId}
                  className="rounded-full border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {teluguQuickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading || status === "loading" || !collegeId}
                  className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl rounded-2xl p-4 shadow ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "border bg-white text-slate-800"
              }`}
            >
              {message.role === "ai" ? (
                <AssistantMessageBody content={message.content} />
              ) : (
                <p className="whitespace-pre-wrap">{String(message.content ?? "")}</p>
              )}
              <p className="mt-2 text-xs opacity-60">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <QuickChip
            icon={<Sparkles className="h-4 w-4" />}
            label="Today"
            onClick={() => sendMessage("Show today attendance")}
            disabled={loading || status === "loading" || !collegeId}
          />
          <QuickChip
            icon={<Users className="h-4 w-4" />}
            label="Absentees"
            onClick={() => sendMessage("Who is absent today?")}
            disabled={loading || status === "loading" || !collegeId}
          />
          <QuickChip
            icon={<CalendarDays className="h-4 w-4" />}
            label="Monthly"
            onClick={() => sendMessage("Show monthly report")}
            disabled={loading || status === "loading" || !collegeId}
          />
          <QuickChip
            icon={<TriangleAlert className="h-4 w-4" />}
            label="Low Attendance"
            onClick={() => sendMessage("List students with low attendance")}
            disabled={loading || status === "loading" || !collegeId}
          />
          <QuickChip
            icon={<Sparkles className="h-4 w-4" />}
            label="ఈరోజు"
            onClick={() => sendMessage("ఈరోజు అటెండెన్స్ చూపించు")}
            disabled={loading || status === "loading" || !collegeId}
          />
          <QuickChip
            icon={<Users className="h-4 w-4" />}
            label="ఎవరు absent"
            onClick={() => sendMessage("ఈరోజు ఎవరు absent")}
            disabled={loading || status === "loading" || !collegeId}
          />
          <QuickChip
            icon={<CalendarDays className="h-4 w-4" />}
            label="నెలవారీ"
            onClick={() => sendMessage("నెలవారీ అటెండెన్స్ చూపించు")}
            disabled={loading || status === "loading" || !collegeId}
          />
          {role === "principal" && (
            <QuickChip
              icon={<Users className="h-4 w-4" />}
              label="Compare Groups"
              onClick={() => sendMessage("Compare all groups today")}
              disabled={loading || status === "loading" || !collegeId}
            />
          )}
          {role === "principal" && (
            <QuickChip
              icon={<Users className="h-4 w-4" />}
              label="గ్రూపులు compare"
              onClick={() => sendMessage("అన్ని గ్రూపులు compare చేయి")}
              disabled={loading || status === "loading" || !collegeId}
            />
          )}
        </div>

        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading || status === "loading" || !collegeId}
            placeholder="Ask something... / తెలుగులో కూడా అడగండి"
            className="flex-1 resize-none rounded-xl border p-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          {speechSupported && (
            <button
              onClick={toggleVoiceInput}
              disabled={loading || status === "loading" || !collegeId}
              className={`rounded-xl border p-3 transition ${
                listening
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-slate-200 bg-white text-slate-700"
              } disabled:cursor-not-allowed disabled:opacity-50`}
              title="Speak in Telugu or English"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => sendMessage()}
            disabled={loading || status === "loading" || !collegeId}
            className="rounded-xl bg-blue-500 p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {!collegeId && status !== "loading" && (
          <p className="pt-3 text-sm text-red-500">
            You need an active college session to use this assistant.
          </p>
        )}
        {speechSupported && listening && (
          <p className="pt-3 text-sm text-rose-600">
            Listening... Telugu or English లో మాట్లాడండి.
          </p>
        )}
      </div>
    </div>
  );
}

function QuickChip({ icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  );
}
