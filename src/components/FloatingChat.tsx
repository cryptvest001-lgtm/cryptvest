"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, LogIn } from "lucide-react";
import { apiGetUser, apiPostUser, getToken } from "@/lib/api";

interface ChatMessage {
  id: string;
  text: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAuthed(!!getToken());
  }, []);

  useEffect(() => {
    if (!isAuthed) return;

    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [isAuthed]);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(0);
    }
  }, [messages, isOpen]);

  async function loadMessages() {
    try {
      const res = await apiGetUser("/support/chat");
      if (res.ok) {
        const data = await res.json();
        if (data.messages.length > messages.length && !isOpen) {
          setUnread((prev) => prev + (data.messages.length - messages.length));
        }
        setMessages(data.messages);
      }
    } catch (e) {
      // Silently fail if offline
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input;
    setInput("");

    // Optimistic update
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      text,
      role: "USER",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const res = await apiPostUser("/support/chat", { text });
    if (res.ok) {
      loadMessages();
    }
  }

  if (isOpen && !isAuthed) {
    return (
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        <div
          className="w-[90vw] sm:w-96 rounded-2xl overflow-hidden flex flex-col shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-300"
          style={{
            background: "rgba(15, 15, 20, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">
              Welcome to Cryptvest
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Please sign in or create an account to chat with our support team.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              href="/login"
              className="btn-primary flex-1 py-2 text-sm text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-outline flex-1 py-2 text-sm text-center"
            >
              Register
            </Link>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all relative"
          style={{
            background: "linear-gradient(135deg, #00f0ff, #a855f7)",
            boxShadow: "0 4px 20px rgba(0,240,255,0.3)",
          }}
        >
          <X size={24} className="text-black" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {isOpen && isAuthed && (
        <div
          className="w-[90vw] sm:w-96 h-[70vh] sm:h-[500px] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300"
          style={{
            background: "rgba(15, 15, 20, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between border-b border-white/10"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,240,255,0.1), rgba(168,85,247,0.1))",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-cyan/20 flex items-center justify-center border border-cyan/30">
                <MessageCircle size={18} className="text-cyan" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Cryptvest Support
                </p>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  We typically reply in minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-xs text-gray-500 mt-10">
                <p>👋 Hi! How can we help you today?</p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "USER"
                      ? "bg-cyan text-black rounded-tr-none"
                      : "bg-white/10 text-white rounded-tl-none border border-white/5"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-cyan/50 transition-all"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="h-10 w-10 rounded-xl bg-cyan text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all relative"
        style={{
          background: "linear-gradient(135deg, #00f0ff, #a855f7)",
          boxShadow: "0 4px 20px rgba(0,240,255,0.3)",
        }}
      >
        {isOpen ? (
          <X size={24} className="text-black" />
        ) : (
          <MessageCircle size={24} className="text-black" />
        )}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
