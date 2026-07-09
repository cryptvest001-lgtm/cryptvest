"use client";

import { useEffect, useState } from "react";
import { apiGetUser } from "@/lib/api";

type Tab = "all" | "deposits" | "withdrawals" | "stakes" | "earnings";

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

type ActivityData = {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  stakes: Stake[];
  earnings: Earning[];
};

type TimelineItem = {
  id: string;
  type: "Deposit" | "Withdrawal" | "Stake" | "Earning";
  asset?: string;
  amount: number;
  status?: string;
  description: string;
  date: string;
};

const EMPTY_ACTIVITY: ActivityData = {
  deposits: [],
  withdrawals: [],
  stakes: [],
  earnings: [],
};

export default function ActivityPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await apiGetUser("/activity");
        if (res.ok) {
          setData(await res.json());
          return;
        }

        const [depositsRes, withdrawalsRes, stakesRes] = await Promise.all([
          apiGetUser("/deposits/history"),
          apiGetUser("/withdrawals/my"),
          apiGetUser("/stakes/my"),
        ]);

        const [depositsBody, withdrawalsBody, stakesBody] = await Promise.all([
          depositsRes.ok ? depositsRes.json() : Promise.resolve({}),
          withdrawalsRes.ok ? withdrawalsRes.json() : Promise.resolve({}),
          stakesRes.ok ? stakesRes.json() : Promise.resolve({}),
        ]);

        setData({
          deposits: depositsBody.deposits ?? [],
          withdrawals: withdrawalsBody.requests ?? [],
          stakes: stakesBody.stakes ?? [],
          earnings: [],
        });
      } catch {
        setData(EMPTY_ACTIVITY);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, []);

  const timeline: TimelineItem[] = data
    ? [
        ...data.deposits.map((d) => ({
          id: d.id,
          type: "Deposit" as const,
          asset: d.asset,
          amount: Number(d.amount),
          status: d.status,
          description: d.txHash,
          date: d.createdAt,
        })),
        ...data.withdrawals.map((w) => ({
          id: w.id,
          type: "Withdrawal" as const,
          asset: w.asset,
          amount: Number(w.amount),
          status: w.status,
          description: w.sourceType,
          date: w.createdAt,
        })),
        ...data.stakes.map((s) => ({
          id: s.id,
          type: "Stake" as const,
          asset: s.asset,
          amount: Number(s.principal),
          status: s.status,
          description: s.stakePlan.name,
          date: s.startDate,
        })),
        ...data.earnings.map((e) => ({
          id: e.id,
          type: "Earning" as const,
          amount: Number(e.amount),
          status: "EARNED",
          description: "Daily staking earning",
          date: e.date,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: timeline.length },
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

  const selectedCount =
    tab === "all" ? timeline.length : data?.[tab].length ?? 0;

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
        ) : !data || selectedCount === 0 ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: "rgba(226,232,240,0.45)" }}
          >
            No transaction history yet.
          </div>
        ) : (
          <div>
            {tab === "all" &&
              timeline.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-bold text-white">
                      {item.type}
                      {item.asset ? ` · ${item.asset}` : ""}
                    </p>
                    <p
                      className="font-mono text-sm font-bold tabular-nums"
                      style={{ color: item.type === "Earning" ? "#22c55e" : "rgba(226,232,240,0.85)" }}
                    >
                      {item.type === "Earning" ? "+" : ""}
                      {item.amount.toFixed(8)}
                    </p>
                    <p
                      className="text-xs truncate max-w-xs"
                      style={{ color: "rgba(226,232,240,0.45)" }}
                    >
                      {item.description} · {new Date(item.date).toLocaleString()}
                    </p>
                  </div>
                  {item.status && (
                    <span
                      className={statusBadge(item.status, {
                        CONFIRMED: "badge-green",
                        PENDING: "badge-amber",
                        APPROVED: "badge-cyan",
                        REJECTED: "badge-red",
                        PAID: "badge-green",
                        ACTIVE: "badge-green",
                        MATURED: "badge-cyan",
                        WITHDRAWN: "badge-muted",
                        EARNED: "badge-green",
                      })}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
              ))}
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
