"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";
import { Wallet, PlusCircle, CheckCircle2, Loader2 } from "lucide-react";

interface Deposit {
  id: string;
  asset: string;
  network: string;
  amount: string;
  txHash: string;
  status: string;
  confirmations: number;
  createdAt: string;
  user: { email: string };
}

const ASSET_NETWORKS: Record<string, string> = {
  BTC: "BTC",
  USDT: "ERC20",
};

const STATUS_BADGES: Record<string, string> = {
  PENDING: "badge-amber",
  CONFIRMED: "badge-green",
};

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED">("PENDING");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [approvalSuccess, setApprovalSuccess] = useState("");

  // Deposit Address Form
  const [addrEmail, setAddrEmail] = useState("");
  const [addrAsset, setAddrAsset] = useState("BTC");
  const [addrValue, setAddrValue] = useState("");
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const [addrError, setAddrError] = useState("");
  const [addrSuccess, setAddrSuccess] = useState("");

  // Manual Deposit Form
  const [depEmail, setDepEmail] = useState("");
  const [depAsset, setDepAsset] = useState("BTC");
  const [depAmount, setDepAmount] = useState("");
  const [depTxHash, setDepTxHash] = useState("");
  const [depSubmitting, setDepSubmitting] = useState(false);
  const [depError, setDepError] = useState("");
  const [depSuccess, setDepSuccess] = useState("");

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    setLoadError("");
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await apiGetAdmin(`/admin/deposits${query}`);
    if (res.ok) {
      setDeposits((await res.json()).deposits);
    } else {
      const body = await res.json().catch(() => ({}));
      setDeposits([]);
      setLoadError(body.error || "Could not load deposit requests.");
    }
    setLoading(false);
  }

  async function handleAssignAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddrError("");
    setAddrSuccess("");
    setAddrSubmitting(true);

    const res = await apiPostAdmin("/admin/deposit-address", {
      email: addrEmail,
      asset: addrAsset,
      network: ASSET_NETWORKS[addrAsset],
      address: addrValue,
    });
    setAddrSubmitting(false);

    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setAddrError(b.error || "Failed to assign address");
      return;
    }

    setAddrSuccess(`Address assigned for ${addrEmail}`);
    setAddrEmail("");
    setAddrValue("");
  }

  async function handleManualDeposit(e: React.FormEvent) {
    e.preventDefault();
    setDepError("");
    setDepSuccess("");
    setDepSubmitting(true);

    const res = await apiPostAdmin("/admin/deposits/manual", {
      email: depEmail,
      asset: depAsset,
      network: ASSET_NETWORKS[depAsset],
      amount: Number(depAmount),
      txHash: depTxHash || undefined,
    });
    setDepSubmitting(false);

    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setDepError(b.error || "Failed to create deposit");
      return;
    }

    setDepSuccess(`Deposit recorded for ${depEmail}. It is now pending confirmation.`);
    setDepEmail("");
    setDepAmount("");
    setDepTxHash("");
    load();
  }

  async function handleConfirm(id: string) {
    setConfirming(id);
    setApprovalSuccess("");
    const res = await apiPostAdmin(`/admin/deposits/${id}/confirm`, {});
    setConfirming(null);

    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      alert(b.error || "Failed to confirm deposit");
      return;
    }
    setApprovalSuccess("Deposit approved and credited to the user's balance.");
    load();
  }

  const pendingCount = deposits.filter((d) => d.status === "PENDING").length;
  const listTitle =
    filter === "PENDING"
      ? "Pending Deposit Approval Requests"
      : filter === "CONFIRMED"
        ? "Confirmed Deposits"
        : "All Deposits";

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Deposits</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Assign Deposit Address */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wallet size={16} className="text-cyan" />
            Assign Deposit Address
          </h2>
          {addrError && <p className="alert-red text-sm">{addrError}</p>}
          {addrSuccess && <p className="alert-green text-sm">{addrSuccess}</p>}
          <form onSubmit={handleAssignAddress} className="space-y-3">
            <input
              type="email"
              value={addrEmail}
              onChange={(e) => setAddrEmail(e.target.value)}
              className="input-dark w-full px-3 py-2 text-sm outline-none"
              placeholder="User email"
              required
            />
            <select
              value={addrAsset}
              onChange={(e) => setAddrAsset(e.target.value)}
              className="select-dark w-full px-3 py-2 text-sm outline-none"
            >
              <option value="BTC">BTC (Bitcoin network)</option>
              <option value="USDT">USDT (ERC-20)</option>
            </select>
            <input
              value={addrValue}
              onChange={(e) => setAddrValue(e.target.value)}
              className="input-dark w-full px-3 py-2 text-sm font-mono outline-none"
              placeholder="Deposit address"
              required
            />
            <button disabled={addrSubmitting} className="btn-primary w-full py-2 text-sm">
              {addrSubmitting ? "Assigning..." : "Assign Address"}
            </button>
          </form>
        </div>

        {/* Manual Deposit Entry */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PlusCircle size={16} className="text-green-500" />
            Record Manual Deposit
          </h2>
          {depError && <p className="alert-red text-sm">{depError}</p>}
          {depSuccess && <p className="alert-green text-sm">{depSuccess}</p>}
          <form onSubmit={handleManualDeposit} className="space-y-3">
            <input
              type="email"
              value={depEmail}
              onChange={(e) => setDepEmail(e.target.value)}
              className="input-dark w-full px-3 py-2 text-sm outline-none"
              placeholder="User email"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={depAsset}
                onChange={(e) => setDepAsset(e.target.value)}
                className="select-dark w-full px-3 py-2 text-sm outline-none"
              >
                <option value="BTC">BTC</option>
                <option value="USDT">USDT</option>
              </select>
              <input
                type="number"
                step="any"
                min="0"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                className="input-dark w-full px-3 py-2 text-sm font-mono outline-none"
                placeholder="Amount"
                required
              />
            </div>
            <input
              value={depTxHash}
              onChange={(e) => setDepTxHash(e.target.value)}
              className="input-dark w-full px-3 py-2 text-sm font-mono outline-none"
              placeholder="Tx hash (optional)"
            />
            <button disabled={depSubmitting} className="btn-primary w-full py-2 text-sm">
              {depSubmitting ? "Recording..." : "Record Deposit (Pending)"}
            </button>
          </form>
        </div>
      </div>

      {/* Deposits List */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{listTitle}</h2>
            {filter === "PENDING" && (
              <p className="mt-1 text-xs" style={{ color: "rgba(226,232,240,0.45)" }}>
                {pendingCount} request{pendingCount === 1 ? "" : "s"} awaiting approval
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Refresh
            </button>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {(["PENDING", "CONFIRMED", "ALL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === f ? "bg-cyan text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
            </div>
          </div>
        </div>

        {approvalSuccess && <p className="alert-green m-5 mb-0 text-sm">{approvalSuccess}</p>}
        {loadError && <p className="alert-red m-5 mb-0 text-sm">{loadError}</p>}

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : deposits.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "rgba(226,232,240,0.45)" }}>
            {filter === "PENDING"
              ? "No pending deposit approval requests."
              : "No deposits found."}
          </div>
        ) : (
          <div>
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0">
                <div>
                  <p className="font-mono text-sm font-bold tabular-nums text-white">
                    {Number(d.amount).toFixed(8)} {d.asset}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(226,232,240,0.5)" }}>
                    {d.user.email}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(226,232,240,0.4)" }}>
                    Requested {new Date(d.createdAt).toLocaleString()}
                  </p>
                  <p className="font-mono text-xs truncate max-w-xs" style={{ color: "rgba(226,232,240,0.35)" }}>
                    {d.txHash}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_BADGES[d.status] ?? "badge-muted"}`}>{d.status}</span>
                  {d.status === "PENDING" && (
                    <button
                      onClick={() => handleConfirm(d.id)}
                      disabled={confirming === d.id}
                      className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {confirming === d.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
