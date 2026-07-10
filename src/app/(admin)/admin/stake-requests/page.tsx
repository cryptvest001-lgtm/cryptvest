"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";

interface StakeRequest {
  id: string;
  asset: string;
  amount: string;
  status: string;
  createdAt: string;
  user: { id: string; email: string };
  stakePlan: {
    name: string;
    type: string;
    dailyRatePercent: string;
  };
}

export default function AdminStakeRequestsPage() {
  const [requests, setRequests] = useState<StakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    const res = await apiGetAdmin("/admin/stakes/requests");
    if (res.ok) setRequests((await res.json()).requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setActing(id);
    setError("");
    setSuccess("");
    const res = await apiPostAdmin(`/admin/stakes/requests/${id}/decision`, {
      status,
      reason: reason || undefined,
    });
    setActing(null);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to update stake request");
      return;
    }

    setReason("");
    setSuccess(
      status === "APPROVED"
        ? "Stake request approved and stake created."
        : "Stake request rejected.",
    );
    load();
  }

  const rejectBtn =
    "rounded-xl px-3 py-1.5 text-sm font-semibold text-white transition-all disabled:opacity-50";

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Stake Requests
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "rgba(226,232,240,0.45)" }}
          >
            Approve user requests to create stakes from available balances.
          </p>
        </div>
        <button onClick={load} className="btn-outline px-4 py-2 text-sm">
          Refresh
        </button>
      </div>

      {error && <p className="alert-red text-sm">{error}</p>}
      {success && <p className="alert-green text-sm">{success}</p>}

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
            No pending stake requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="glass p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p
                    className="font-mono font-bold tabular-nums"
                    style={{ color: "rgba(226,232,240,0.85)" }}
                  >
                    {Number(request.amount).toFixed(8)} {request.asset}
                  </p>
                  <p className="text-sm text-white">
                    {request.stakePlan.name} · {request.stakePlan.type}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(226,232,240,0.6)" }}
                  >
                    {request.user.email} ·{" "}
                    {Number(request.stakePlan.dailyRatePercent).toFixed(4)}
                    %/day
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(226,232,240,0.45)" }}
                  >
                    Requested {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="badge badge-cyan">{request.status}</span>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason or note (optional)"
                  className="input-dark flex-1 px-3 py-1.5 text-sm outline-none"
                />
                <button
                  onClick={() => decide(request.id, "APPROVED")}
                  disabled={acting === request.id}
                  className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => decide(request.id, "REJECTED")}
                  disabled={acting === request.id}
                  className={rejectBtn}
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
