"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";

interface Submission {
  id: string;
  providerReference: string;
  payload: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    documentType: string;
    documentNumber: string;
  };
  user: { id: string; email: string };
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await apiGetAdmin("/admin/kyc/queue");
    if (!res.ok) {
      setError("Failed to load queue");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSubmissions(data.submissions);
    setLoading(false);
  }

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setActing(id);
    const res = await apiPostAdmin(`/admin/kyc/${id}/decision`, {
      status,
      reason,
    });
    setActing(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Decision failed");
      return;
    }
    setReason("");
    load();
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">KYC review queue</h1>
        <span className="badge badge-cyan">{submissions.length} pending</span>
      </div>
      {error && <p className="alert-red text-sm">{error}</p>}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="glass p-6">
          <p className="text-sm" style={{ color: "rgba(226,232,240,0.45)" }}>
            No pending submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="glass p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-white">
                    {s.payload.firstName} {s.payload.lastName}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(226,232,240,0.55)" }}
                  >
                    {s.user.email}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(226,232,240,0.55)" }}
                  >
                    DOB: {s.payload.dateOfBirth} · {s.payload.documentType}:{" "}
                    {s.payload.documentNumber}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(226,232,240,0.35)" }}
                  >
                    Ref: {s.providerReference}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decide(s.id, "APPROVED")}
                    disabled={acting === s.id}
                    className="btn-primary px-4 py-1.5 text-sm disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide(s.id, "REJECTED")}
                    disabled={acting === s.id}
                    className="rounded-xl px-4 py-1.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "rgba(239,68,68,0.2)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "rgba(239,68,68,0.12)")
                    }
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="glass p-4">
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Reason (used for rejections)
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm outline-none"
              placeholder="Optional reason for the latest decision"
            />
          </div>
        </div>
      )}
    </main>
  );
}
