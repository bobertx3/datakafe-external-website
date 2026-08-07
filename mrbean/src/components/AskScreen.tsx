"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const starterQuestions = [
  "What is Julian allergic to?",
  "What's his bedtime routine?",
  "His blood levels at last appointment?",
  "What size diapers is he in?",
];

interface AskScreenProps {
  onBack: () => void;
}

export function AskScreen({ onBack }: AskScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Hey! I'm Mr. Bean. Ask me anything about Julian — I remember everything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function speak(text: string) {
    if (!isSpeaking) return;
    audioRef.current?.pause();
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch {
      // fallback to browser voice if OpenAI TTS unavailable
      if ("speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utt);
      }
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/memories/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const { answer } = await res.json();
      setIsTyping(false);
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      speak(answer);
    } catch {
      setIsTyping(false);
      const errMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I couldn't reach my memory right now. Try again in a moment.",
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  }

  function toggleListen() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      sendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-slate-100 bg-white">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl active:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">Ask Mr. Bean</h1>
          <p className="text-xs text-slate-400">About Julian</p>
        </div>
        <button
          onClick={() => {
            setIsSpeaking((v) => !v);
            if (isSpeaking) { audioRef.current?.pause(); audioRef.current = null; }
          }}
          className="p-2 rounded-xl active:bg-slate-100 transition-colors"
        >
          {isSpeaking ? (
            <Volume2 className="w-5 h-5 text-teal-500" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {/* Starter questions (only when just the welcome message) */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {starterQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full active:bg-slate-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <span className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
                R
              </span>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-teal-500 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              R
            </span>
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 pb-28 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
          <input
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button
            onClick={toggleListen}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isListening ? "bg-rose-100 text-rose-500" : "text-slate-400 active:bg-slate-200"
            )}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-teal-500 text-white disabled:opacity-30 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

