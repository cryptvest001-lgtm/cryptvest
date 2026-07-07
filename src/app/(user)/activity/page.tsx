"use client";

import { useEffect, useState } from "react";
import { apiGetUser } from "@/lib/api";

type Tab = "deposits" | "withdrawals" | "stakes" | "earnings";

interface Deposit {
  id: string;
  asset: string;
  amount: string;
  status: string;
  txHash: string;
  createdAt: string;
}
interface Withdrawal {
  id: string;
  asset: string;
  amount: string;
  status: string;
  sourceType: string;
  createdAt: string;
}
interface Stake {
  id: string;
  asset: string;
  principal: string;
  accruedEarnings: string;
  status: string;
  stakePlan: { name: string };
  startDate: string;
}
interface Earning {
  id: string;
  amount: string;
  date: string;
}

export default function ActivityPage() {
  const [tab, setTab] = useState<Tab>("deposits");
  const [data, setData] = useState<{
    deposits: Deposit[];
    withdrawals: Withdrawal[];
    stakes: Stake[];
    earnings: Earning[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetUser("/activity").then(async (res) => {
      if (res.ok) setData(await res.json());
      setLoading(false);
    });
  }, []);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "deposits", label: "Deposits", count: data?.deposits.length ?? 0 },
    {
      key: "withdrawals",
      label: "Withdrawals",
      count: data?.withdrawals.length ?? 0,
    },
    { key: "stakes", label: "Stakes", count: data?.stakes.length ?? 0 },
    { key: "earnings", label: "Earnings", count: data?.earnings.length ?? 0 },
  ];

  const statusBadge = (status: string, map: Record<string, string>) =>
    `badge ${map[status] ?? "badge-muted"}`;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Activity</h1>

      <div
        className="flex gap-1 rounded-xl p-1 w-fit max-w-full overflow-x-auto"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="rounded-lg px-3 sm:px-4 py-1.5 text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0"
            style={
              tab === key
                ? {
                    background: "rgba(0,240,255,0.12)",
                    color: "#00f0ff",
                    border: "1px solid rgba(0,240,255,0.25)",
                  }
                : {
                    background: "transparent",
                    color: "rgba(226,232,240,0.45)",
                    border: "1px solid transparent",
                  }
            }
            onMouseEnter={(e) => {
              if (tab !== key) {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(226,232,240,0.7)";
              }
            }}
            onMouseLeave={(e) => {
              if (tab !== key) {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(226,232,240,0.45)";
              }
            }}
          >
            {label}
            {count > 0 && (
              <span
                className="ml-1.5 font-mono text-xs tabular-nums"
                style={{ opacity: 0.6 }}
              >
                ({count})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </div>
        ) : !data || data[tab].length === 0 ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: "rgba(226,232,240,0.45)" }}
          >
            No {tab} yet.
          </div>
        ) : (
          <div>
            {tab === "deposits" &&
              data.deposits.map((d) => (
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
                      className="font-mono text-xs truncate max-w-xs"
                      style={{ color: "rgba(226,232,240,0.35)" }}
                    >
                      {d.txHash}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(226,232,240,0.4)" }}
                    >
                      {new Date(d.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={statusBadge(d.status, {
                      CONFIRMED: "badge-green",
                      PENDING: "badge-amber",
                    })}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            {tab === "withdrawals" &&
              data.withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0"
                >
                  <div>
                    <p
                      className="font-mono text-sm font-bold tabular-nums"
                      style={{ color: "rgba(226,232,240,0.85)" }}
                    >
                      {Number(w.amount).toFixed(8)} {w.asset}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(226,232,240,0.45)" }}
                    >
                      {w.sourceType} · {new Date(w.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={statusBadge(w.status, {
                      PENDING: "badge-cyan",
                      APPROVED: "badge-cyan",
                      REJECTED: "badge-red",
                      PAID: "badge-green",
                    })}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
            {tab === "stakes" &&
              data.stakes.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-bold text-white">
                      {s.stakePlan.name} · {s.asset}
                    </p>
                    <p
                      className="font-mono text-xs tabular-nums"
                      style={{ color: "rgba(226,232,240,0.45)" }}
                    >
                      {Number(s.principal).toFixed(8)} principal · started{" "}
                      {new Date(s.startDate).toLocaleDateString()}
                    </p>
                    <p
                      className="font-mono text-xs tabular-nums"
                      style={{ color: "#22c55e" }}
                    >
                      +{Number(s.accruedEarnings).toFixed(8)} earned
                    </p>
                  </div>
                  <span
                    className={statusBadge(s.status, {
                      ACTIVE: "badge-green",
                      MATURED: "badge-cyan",
                      WITHDRAWN: "badge-muted",
                    })}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            {tab === "earnings" &&
              data.earnings.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0"
                >
                  <p
                    className="font-mono text-sm font-bold tabular-nums"
                    style={{ color: "#22c55e" }}
                  >
                    +{Number(e.amount).toFixed(8)}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(226,232,240,0.45)" }}
                  >
                    {new Date(e.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
