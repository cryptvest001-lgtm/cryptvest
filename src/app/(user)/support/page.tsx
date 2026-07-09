"use client";

import { useEffect, useState } from "react";
import { apiGetUser, apiPostUser } from "@/lib/api";
import { Plus, MessageSquareText, Clock, CheckCircle2 } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGES: Record<string, string> = {
  OPEN: "badge-cyan",
  PENDING: "badge-amber",
  CLOSED: "badge-muted",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await apiGetUser("/support/tickets");
    if (res.ok) setTickets((await res.json()).tickets);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const res = await apiPostUser("/support/tickets", { subject, message });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to create ticket");
      return;
    }

    setSuccess("Ticket created! Our support team will respond shortly.");
    setSubject("");
    setMessage("");
    setShowForm(false);
    load();
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">Support Tickets</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {success && <p className="alert-green text-sm">{success}</p>}

      {showForm && (
        <div className="glass p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Create a new ticket</h2>
          {error && <p className="alert-red text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-dark w-full px-3 py-2.5 text-sm outline-none"
                placeholder="e.g. Issue with withdrawal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-dark w-full px-3 py-2.5 text-sm outline-none min-h-[120px] resize-none"
                placeholder="Describe your issue in detail..."
                required
              />
            </div>
            <button disabled={submitting} className="btn-primary w-full py-2.5 text-sm">
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      )}

      <div className="glass overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">Your Tickets</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "rgba(226,232,240,0.45)" }}>
            <MessageSquareText size={32} className="mx-auto mb-3 opacity-30" />
            No support tickets yet. Need help? Create one above, or use the live chat.
          </div>
        ) : (
          <div>
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] last:border-b-0">
                <div>
                  <p className="text-sm font-bold text-white">{t.subject}</p>
                  <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "rgba(226,232,240,0.45)" }}>
                    <Clock size={12} />
                    Updated {new Date(t.updatedAt).toLocaleString()}
                  </p>
                </div>
                <span className={`badge ${STATUS_BADGES[t.status] ?? "badge-muted"}`}>{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
