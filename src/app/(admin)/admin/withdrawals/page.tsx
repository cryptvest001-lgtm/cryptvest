"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";

interface Request {
  id: string;
  asset: string;
  amount: string;
  sourceType: string;
  status: string;
  createdAt: string;
  reason: string | null;
  user: { id: string; email: string };
}

const STATUS_BADGES: Record<string, string> = {
  PENDING: "badge-cyan",
  APPROVED: "badge-cyan",
  REJECTED: "badge-red",
  PAID: "badge-green",
};

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await apiGetAdmin("/admin/withdrawals");
    if (res.ok) setRequests((await res.json()).requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setActing(id);
    setError("");
    const res = await apiPostAdmin(`/admin/withdrawals/${id}/decision`, {
      status,
      reason: reason || undefined,
    });
    setActing(null);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Failed");
      return;
    }
    setReason("");
    load();
  }

  async function markPaid(id: string) {
    if (!txHash.trim()) {
      setError("Enter a txHash to mark as paid");
      return;
    }
    setActing(id);
    setError("");
    const res = await apiPostAdmin(`/admin/withdrawals/${id}/paid`, { txHash });
    setActing(null);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Failed");
      return;
    }
    setTxHash("");
    load();
  }

  const rejectBtn =
    "rounded-xl px-3 py-1.5 text-sm font-semibold text-white transition-all disabled:opacity-50";

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-white">
        Withdrawal Approvals
      </h1>
      {error && <p className="alert-red text-sm">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="glass p-6">
          <p className="text-sm" style={{ color: "rgba(226,232,240,0.45)" }}>
            No withdrawal requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="glass p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p
                    className="font-mono font-bold tabular-nums"
                    style={{ color: "rgba(226,232,240,0.85)" }}
                  >
                    {Number(r.amount).toFixed(8)} {r.asset}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(226,232,240,0.6)" }}
                  >
                    {r.user.email} · {r.sourceType}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(226,232,240,0.45)" }}
                  >
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`badge ${STATUS_BADGES[r.status] ?? "badge-muted"}`}
                >
                  {r.status}
                </span>
              </div>

              {r.status === "PENDING" && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-white/[0.06] pt-3">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional for rejection)"
                    className="input-dark flex-1 px-3 py-1.5 text-sm outline-none"
                  />
                  <button
                    onClick={() => decide(r.id, "APPROVED")}
                    disabled={acting === r.id}
                    className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide(r.id, "REJECTED")}
                    disabled={acting === r.id}
                    className={rejectBtn}
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
              )}

              {r.status === "APPROVED" && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-white/[0.06] pt-3">
                  <input
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Transaction hash"
                    className="input-dark flex-1 px-3 py-1.5 text-sm font-mono outline-none"
                  />
                  <button
                    onClick={() => markPaid(r.id)}
                    disabled={acting === r.id}
                    className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Mark Paid
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
