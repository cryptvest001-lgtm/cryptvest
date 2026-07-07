"use client";

import { useState } from "react";
import { apiGetUser, apiPostUser } from "@/lib/api";
import { Copy, CheckCircle } from "lucide-react";

const ASSETS = [
  {
    asset: "BTC",
    network: "BTC",
    label: "Bitcoin (BTC)",
    description: "Bitcoin network",
  },
  {
    asset: "USDT",
    network: "ERC20",
    label: "USDT (ERC-20)",
    description: "Ethereum network",
  },
];

interface DepositAddress {
  address: string;
  asset: string;
  network: string;
}

interface Deposit {
  id: string;
  asset: string;
  amount: string;
  status: string;
  txHash: string;
  createdAt: string;
}

export default function DepositPage() {
  const [selected, setSelected] = useState<(typeof ASSETS)[0] | null>(null);
  const [depositAddress, setDepositAddress] = useState<DepositAddress | null>(
    null,
  );
  const [history, setHistory] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function selectAsset(opt: (typeof ASSETS)[0]) {
    setSelected(opt);
    setDepositAddress(null);
    setError("");
    setLoading(true);
    const [addrRes, histRes] = await Promise.all([
      apiPostUser("/deposits/address", {
        asset: opt.asset,
        network: opt.network,
      }),
      apiGetUser("/deposits/history"),
    ]);
    setLoading(false);
    if (addrRes.ok) {
      setDepositAddress(await addrRes.json());
    } else {
      setError("Could not generate address");
    }
    if (histRes.ok) {
      const data = await histRes.json();
      setHistory(data.deposits.filter((d: Deposit) => d.asset === opt.asset));
    }
  }

  function copyAddress() {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Deposit</h1>

      <div className="glass p-6 space-y-4">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(226,232,240,0.4)" }}
        >
          Select asset
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ASSETS.map((opt) => (
            <button
              key={opt.asset + opt.network}
              onClick={() => selectAsset(opt)}
              className="rounded-xl border p-4 text-left transition-all"
              style={
                selected?.asset === opt.asset &&
                selected?.network === opt.network
                  ? {
                      background: "rgba(0,240,255,0.06)",
                      border: "1px solid rgba(0,240,255,0.35)",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
              onMouseEnter={(e) => {
                if (!(
                  selected?.asset === opt.asset &&
                  selected?.network === opt.network
                )) {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(0,240,255,0.25)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(0,240,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(
                  selected?.asset === opt.asset &&
                  selected?.network === opt.network
                )) {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.03)";
                }
              }}
            >
              <p className="font-bold text-white">{opt.label}</p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(226,232,240,0.45)" }}
              >
                {opt.description}
              </p>
            </button>
          ))}
        </div>

        {loading && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "rgba(226,232,240,0.5)" }}
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
            Generating address...
          </div>
        )}

        {error && <p className="alert-red text-sm">{error}</p>}

        {depositAddress && (
          <div
            className="glass p-4 space-y-3"
            style={{
              background: "rgba(0,240,255,0.02)",
              border: "1px solid rgba(0,240,255,0.12)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Your {depositAddress.asset} deposit address
            </p>
            <div
              className="flex items-center gap-2 rounded-xl p-3"
              style={{
                background: "rgba(10,10,15,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <code
                className="flex-1 break-all font-mono text-xs"
                style={{ color: "rgba(226,232,240,0.6)" }}
              >
                {depositAddress.address}
              </code>
              <button
                onClick={copyAddress}
                className="flex-shrink-0 transition-colors"
                style={{ color: "rgba(226,232,240,0.5)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#00f0ff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(226,232,240,0.5)")
                }
              >
                {copied ? (
                  <CheckCircle size={16} style={{ color: "#22c55e" }} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <p
              className="text-xs rounded-xl px-3 py-2"
              style={{
                background: "rgba(234,179,8,0.08)",
                border: "1px solid rgba(234,179,8,0.15)",
                color: "#eab308",
              }}
            >
              Only send {depositAddress.asset} on the {depositAddress.network}{" "}
              network. Funds sent on wrong networks will be lost.
            </p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="glass overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-bold text-white">Deposit History</h2>
          </div>
          <div>
            {history.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0"
              >
                <div>
                  <p
                    className="font-mono text-sm font-bold tabular-nums"
                    style={{ color: "rgba(226,232,240,0.85)" }}
                  >
                    {Number(d.amount).toFixed(8)} {d.asset}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(226,232,240,0.4)" }}
                  >
                    {new Date(d.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`badge ${d.status === "CONFIRMED" ? "badge-green" : "badge-amber"}`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
