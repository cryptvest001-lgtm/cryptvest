"use client";

import { useEffect, useState, useRef } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";
import { MessageSquare, Ticket, Send, User, Clock, CheckCircle2 } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: { email: string };
  messages?: { text: string; role: string; createdAt: string }[];
}

interface ChatQueue {
  id: string;
  email: string;
  chatMessages: { text: string; createdAt: string; isRead: boolean; role: string }[];
}

interface ChatMessage {
  id: string;
  text: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export default function AdminSupportPage() {
  const [tab, setTab] = useState<"tickets" | "chat">("tickets");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [chatQueues, setChatQueues] = useState<ChatQueue[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Ticket state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Selected Chat state
  const [selectedChatUser, setSelectedChatUser] = useState<ChatQueue | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [tab]);

  useEffect(() => {
    if (selectedChatUser) {
      loadChat(selectedChatUser.id);
      const chatInterval = setInterval(() => loadChat(selectedChatUser.id), 5000);
      return () => clearInterval(chatInterval);
    }
  }, [selectedChatUser]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function load() {
    if (tab === "tickets") {
      const res = await apiGetAdmin("/admin/support/tickets");
      if (res.ok) setTickets((await res.json()).tickets);
    } else {
      const res = await apiGetAdmin("/admin/support/chat/queues");
      if (res.ok) setChatQueues((await res.json()).queues);
    }
    setLoading(false);
  }

  async function loadChat(userId: string) {
    const res = await apiGetAdmin(`/admin/support/chat/${userId}`);
    if (res.ok) setChatMessages((await res.json()).messages);
  }

  async function handleTicketReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !ticketReply.trim()) return;

    setSendingReply(true);
    const res = await apiPostAdmin(`/admin/support/tickets/${selectedTicket.id}/reply`, {
      text: ticketReply,
    });
    setSendingReply(false);

    if (res.ok) {
      setTicketReply("");
      load();
    }
  }

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChatUser || !chatInput.trim()) return;

    const text = chatInput;
    setChatInput("");

    const res = await apiPostAdmin(`/admin/support/chat/${selectedChatUser.id}`, { text });
    if (res.ok) {
      loadChat(selectedChatUser.id);
    }
  }

  return (
    <main className="h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4 sm:p-6 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
        <h1 className="text-2xl font-extrabold text-white">Support Center</h1>
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setTab("tickets")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'tickets' ? 'bg-cyan text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <Ticket size={16} />
            Tickets
          </button>
          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'chat' ? 'bg-cyan text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <MessageSquare size={16} />
            Live Chat
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: List */}
        <div className="w-full sm:w-80 border-r border-white/[0.06] flex flex-col bg-black/10">
          <div className="flex-1 overflow-y-auto">
            {tab === "tickets" ? (
              <div className="divide-y divide-white/[0.04]">
                {tickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-4 text-left hover:bg-white/[0.02] transition-all ${selectedTicket?.id === t.id ? 'bg-white/[0.05] border-l-2 border-cyan' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-tighter px-1.5 rounded ${t.status === 'OPEN' ? 'bg-cyan/20 text-cyan' : 'bg-gray-500/20 text-gray-400'}`}>
                        {t.status}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{t.user.email}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {chatQueues.map(q => {
                   const lastMessage = q.chatMessages[0];
                   const unread = lastMessage && !lastMessage.isRead && lastMessage.role === 'USER';
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedChatUser(q)}
                      className={`w-full p-4 text-left hover:bg-white/[0.02] transition-all ${selectedChatUser?.id === q.id ? 'bg-white/[0.05] border-l-2 border-cyan' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-bold text-white truncate flex-1 mr-2">{q.email}</p>
                        {unread && <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{lastMessage?.text || "No messages"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Detail/Chat */}
        <div className="flex-1 flex flex-col bg-black/5">
          {tab === "tickets" ? (
            selectedTicket ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="font-bold text-white">{selectedTicket.subject}</h2>
                  <p className="text-xs text-gray-500">{selectedTicket.user.email} • Priority: {selectedTicket.priority}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-radial-pulse">
                  <div className="glass p-4 text-sm text-gray-300">
                    <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                      <span className="font-bold text-cyan">Latest Status</span>
                      <span className="text-[10px] text-gray-500">{new Date(selectedTicket.updatedAt).toLocaleString()}</span>
                    </div>
                    This ticket is currently <strong>{selectedTicket.status}</strong>.
                  </div>
                </div>
                <form onSubmit={handleTicketReply} className="p-4 border-t border-white/[0.06] bg-black/40">
                  <textarea
                    value={ticketReply}
                    onChange={e => setTicketReply(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan/50 transition-all resize-none mb-2"
                    placeholder="Type your response..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button disabled={sendingReply} className="btn-primary px-6 py-2 text-sm flex items-center gap-2">
                      <Send size={14} />
                      {sendingReply ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                   <Ticket size={32} />
                </div>
                <p>Select a ticket to view conversation</p>
              </div>
            )
          ) : (
            selectedChatUser ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan border border-cyan/20">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{selectedChatUser.email}</p>
                      <p className="text-[10px] text-green-500 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Active
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'ADMIN' ? 'bg-cyan text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                        {m.text}
                        <p className={`text-[10px] mt-1 text-right ${m.role === 'ADMIN' ? 'text-black/50' : 'text-gray-500'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatScrollRef} />
                </div>
                <form onSubmit={handleSendChat} className="p-4 border-t border-white/[0.06] bg-black/40">
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-cyan/50 transition-all"
                      placeholder="Type a message..."
                    />
                    <button className="h-10 w-10 rounded-xl bg-cyan text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                   <MessageSquare size={32} />
                </div>
                <p>Select a user to start chatting</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
