"use client";

import { useEffect, useState } from "react";
import { apiGetUser, apiPostUser } from "@/lib/api";

interface Balance {
  asset: string;
  available: string;
}
interface WithdrawalRequest {
  id: string;
  asset: string;
  amount: string;
  sourceType: string;
  status: string;
  createdAt: string;
  reason: string | null;
  txHash: string | null;
}

const STATUS_BADGES: Record<string, string> = {
  PENDING: "badge-cyan",
  APPROVED: "badge-cyan",
  REJECTED: "badge-red",
  PAID: "badge-green",
};

export default function WithdrawPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [sourceType, setSourceType] = useState("PRINCIPAL");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    const [bRes, hRes] = await Promise.all([
      apiGetUser("/deposits/balances"),
      apiGetUser("/withdrawals/my"),
    ]);
    if (bRes.ok) setBalances((await bRes.json()).balances);
    if (hRes.ok) setHistory((await hRes.json()).requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const available = Number(
    balances.find((b) => b.asset === asset)?.available ?? 0,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const res = await apiPostUser("/withdrawals/request", {
      asset,
      amount: Number(amount),
      sourceType,
      destinationAddress: destination,
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Request failed");
      return;
    }
    setSuccess(
      "Withdrawal request submitted. An admin will review it shortly.",
    );
    setAmount("");
    setDestination("");
    load();
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 min-h-screen">
      <h1 className="text-2xl font-extrabold text-white">Withdraw</h1>

      <div className="glass p-6 space-y-4">
        <h2 className="text-base font-bold text-white">New Request</h2>
        {error && <p className="alert-red text-sm">{error}</p>}
        {success && <p className="alert-green text-sm">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(226,232,240,0.4)" }}
              >
                Asset
              </label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="select-dark w-full px-3 py-2.5 text-sm outline-none"
              >
                <option value="BTC">BTC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(226,232,240,0.4)" }}
              >
                Source
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="select-dark w-full px-3 py-2.5 text-sm outline-none"
              >
                <option value="PRINCIPAL">
                  Principal (available: {available.toFixed(8)})
                </option>
                <option value="EARNINGS">Earnings</option>
              </select>
            </div>
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Amount
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm font-mono outline-none"
              placeholder="0.00000000"
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Destination address
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm font-mono outline-none"
              placeholder="Your external wallet address"
              required
            />
          </div>
          <button
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-sm"
          >
            {submitting ? "Submitting..." : "Request Withdrawal"}
          </button>
        </form>
        <p className="text-xs" style={{ color: "rgba(226,232,240,0.4)" }}>
          Withdrawals require admin approval and are typically processed within
          24 hours.
        </p>
      </div>

      {!loading && history.length > 0 && (
        <div className="glass overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-bold text-white">History</h2>
          </div>
          <div>
            {history.map((r) => (
              <div
                key={r.id}
                className="px-5 py-3 flex items-center justify-between border-b border-white/[0.05] last:border-b-0"
              >
                <div>
                  <p
                    className="font-mono text-sm font-bold tabular-nums"
                    style={{ color: "rgba(226,232,240,0.85)" }}
                  >
                    {Number(r.amount).toFixed(8)} {r.asset}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(226,232,240,0.45)" }}
                  >
                    {r.sourceType} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.reason && (
                    <p
                      className="text-xs italic"
                      style={{ color: "rgba(226,232,240,0.45)" }}
                    >
                      {r.reason}
                    </p>
                  )}
                  {r.txHash && (
                    <p
                      className="font-mono text-xs truncate max-w-xs"
                      style={{ color: "rgba(226,232,240,0.35)" }}
                    >
                      {r.txHash}
                    </p>
                  )}
                </div>
                <span
                  className={`badge ${STATUS_BADGES[r.status] ?? "badge-muted"}`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
